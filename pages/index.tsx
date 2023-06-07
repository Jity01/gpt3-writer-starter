import LogBox from "../components/log-box/log-box";
import { useState, useEffect, useRef } from "react";
import {
  addLog,
  getUserId,
  getLogsByUserId,
  deleteLog,
  addReplyToLog,
  resetReplyLogId,
  addLike,
  addUser,
} from "../utils/client/db-helpers";
import { getProviders, signIn, getSession, signOut, useSession } from 'next-auth/react';
import Button from "../components/button/button";
import LittleButton from "../components/little-button/little-button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../components/root/root";
import Log from "../components/log/log";
import Alert from "../components/alert/alert";
import Head from "next/head";
import { getGeneration, createPromptContext, createTalkToMePrompt} from "../utils/client/prompt-helpers";
import Title from "../components/title/title";
import { stringifyOutputEmbeddings, unstringifyOutputEmbeddings } from "../utils/api/output-stringifier";
import {
  queryVectorDB,
  insertInputIntoFeedbackDB,
  queryFeedbackVectorDB,
  updateFeedbackInput
} from "../utils/client/db-helpers";
import React from "react";

function SnapLog({ userId, logs, providers }) {
  const [logMessage, setlogMessage] = useState(``);
  const [isGenerating, setIsGenerating] = useState({ addLog: false, deleteLog: { id: -1, isDeleting: false }, addLike: { id: -1, isAdding: false }, searchLogs: false, dislikeSearch: false, talkGeneration: false });
  const [updatedLogs, setUpdatedLogs] = useState(!logs ? [] : [...logs].slice(0).sort((a, b) => {
    if (a.num_of_likes === b.num_of_likes) {
      return a.id > b.id ? 1 : -1;
    }
    return a.num_of_likes > b.num_of_likes ? 1 : -1;
    }).reverse());
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState(``);
  const [idOfLogToReplyTo, setIdOfLogToReplyTo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchInputVector,setSearchInputVector] = useState([]);
  const [searchMessage, setSearchMessage] = useState(``);
  const [matches, setMatches] = useState(updatedLogs);
  const [rawMatches, setRawMatches]: any[] = useState([]);
  const [currUserId, setCurrUserId] = useState(userId);
  const [talkMessage, setTalkMessage] = useState({ message: ``, valueToTalkTo: ``});
  const [talkMode, setTalkMode] = useState(false);
  const [alerts, setAlerts]: any[] = useState([]);
  const myRef: any = useRef(null)
  const executeScroll = () => myRef.current?.scrollIntoView();
  const { data: session } = useSession();
  const signUserIn = async () => {
    await signIn("google");
  };
  const setUserCredentials = async () => {
    const session = await getSession();
    const names: any[] = session?.user?.name?.split(" ") as any[];
    userId = await getUserId(names[0], names[1], session?.user?.email);
    logs = await getLogsByUserId(userId);
    setUpdatedLogs(logs.slice(0).sort((a, b) => {
      if (a.num_of_likes === b.num_of_likes) {
        return a.id > b.id ? 1 : -1;
      }
      return a.num_of_likes > b.num_of_likes ? 1 : -1;
      }).reverse());
    setCurrUserId(userId);
  };
  const handleLog = async () => {
    if (currUserId) {
      if (logMessage.length > 0) {
        setIsGenerating({ ...isGenerating, addLog: true});
        await addLog(logMessage, userId, false);
        const newLogs = await getLogsByUserId(userId);
        setUpdatedLogs(newLogs.slice(0).sort((a, b) => {
          if (a.num_of_likes === b.num_of_likes) {
            return a.id > b.id ? 1 : -1;
          }
          return a.num_of_likes > b.num_of_likes ? 1 : -1;
          }).reverse());
        setlogMessage(``);
        setIsGenerating({ ...isGenerating, addLog: false});
      } else {
        setAlerts([...alerts, { message: `you can not enter an empty log`, type: `error` }]);
      }
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  };
  const handleCloseAlert = (index) => {
    const newAlerts = [...alerts];
    newAlerts.splice(index, 1);
    setAlerts(newAlerts);
  };
  const handleDelete = async (logId) => {
    if (currUserId) {
      setIsGenerating({ ...isGenerating, deleteLog: { id: logId, isDeleting: true }});
      await deleteLog(userId, logId);
      const newLogs = await getLogsByUserId(userId);
      setUpdatedLogs(newLogs.slice(0).sort((a, b) => {
        if (a.num_of_likes === b.num_of_likes) {
          return a.id > b.id ? 1 : -1;
        }
        return a.num_of_likes > b.num_of_likes ? 1 : -1;
        }).reverse());
      updatedLogs?.map(async (log) => {
        if (log.reply_log_id === logId) {
          await resetReplyLogId(log.id);
        }
      })
      setIsGenerating({ ...isGenerating, deleteLog: { id: -1, isDeleting: false }});
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  };
  const openReply = (logId) => {
    if (currUserId) {
      executeScroll();
      setReplyMode(true);
      setIdOfLogToReplyTo(logId);
    }
  };
  const closeReply = async () => {
    if (replyMessage.length > 0) {
      setIsGenerating({ ...isGenerating, addLog: true });
      const id = await addLog(replyMessage, userId, true);
      const replyLogId = id;
      await addReplyToLog(idOfLogToReplyTo, replyLogId);
      const newLogs = await getLogsByUserId(userId);
      setUpdatedLogs(newLogs.slice(0).sort((a, b) => {
        if (a.num_of_likes === b.num_of_likes) {
          return a.id > b.id ? 1 : -1;
        }
        return a.num_of_likes > b.num_of_likes ? 1 : -1;
        }).reverse());
      setReplyMode(false);
      setReplyMessage(``);
      setIdOfLogToReplyTo(null);
      setIsGenerating({ ...isGenerating, addLog: false });
    } else {
      setAlerts([...alerts, { message: `you can not enter an empty reply`, type: `error` }]);
    }
  };
  const cancelReply = () => {
    setReplyMode(false);
    setReplyMessage(``);
    setIdOfLogToReplyTo(null);
  };
  const getParentMatches = (logs) => {
    const parentMatches = logs.filter(log => log && log.is_reply === false);
    return parentMatches;
  };
  const getChildrenMatchesOfLog = (log, logs) => {
    const childrenMatches: any = [];
    let currentLog = log;
    while (currentLog && currentLog.reply_log_id) {
      const childMatch = logs.find(log => log && log.id === currentLog.reply_log_id);
      if (childMatch) childrenMatches.push(childMatch);
      currentLog = childMatch;
    }
    return childrenMatches;
  };
  const addLikeToLog = async (logId: number, currentLikes: number) => {
    if (currUserId) {
      setIsGenerating({ ...isGenerating, addLike: { id: logId, isAdding: true } });
      const updatedLikes = currentLikes + 1;
      await addLike(logId, updatedLikes);
      const newLogs = await getLogsByUserId(userId);
      setUpdatedLogs(newLogs.slice(0).sort((a, b) => {
      if (a.num_of_likes === b.num_of_likes) {
        return a.id > b.id ? 1 : -1;
      }
      return a.num_of_likes > b.num_of_likes ? 1 : -1;
      }).reverse());
      const newMatches = matches.map((match) => {
        if (match && match.id === logId) {
          return { ...match, num_of_likes: updatedLikes };
        }
        return match;
      });
      setMatches(newMatches);
      setIsGenerating({ ...isGenerating, addLike: { id: -1, isAdding: false } });
    }
  };
  const generateQuestion = async (message, setMessage) => {
    if (currUserId) {
      setIsGenerating({ ...isGenerating, addLog: true });
      const promptWithContext = createPromptContext(message.slice(0, -3));
      const generatedQuestion = await getGeneration(promptWithContext);
      const questionToInsert = `<strong>${generatedQuestion.replace(/^\n+|\n+$/g, '').replace("<strong>", "").replace("</strong>").replace("*", "")}</strong>`;
      setMessage(`${message.slice(0, -2)}\n${questionToInsert}\n`);
      setIsGenerating({ ...isGenerating, addLog: false });
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  };
  const generateQuestionForTalkToMe = async () => {
    setIsGenerating({ ...isGenerating, talkGeneration: true });
    const formattedTalkMessage = formatTalkMessage(talkMessage.message.slice(0, -3));
    const promptWithContext = createTalkToMePrompt(talkMessage.valueToTalkTo, formattedTalkMessage);
    const generatedQuestion = await getGeneration(promptWithContext);
    const questionToInsert = `<strong>${generatedQuestion.replace(/^\n+|\n+$/g, '').replace("<strong>", "").replace("</strong>").replace("*", "")}</strong>`;
    setTalkMessage({ ...talkMessage, message: `${talkMessage.message.slice(0, -2)}\n${questionToInsert}\n` });
    setIsGenerating({ ...isGenerating, talkGeneration: false });
  };
  const formatTalkMessage = (message) => {
    let newMsgArr = message.split("\n");
    let isMeTurn = true;
    for (let i = 0; i < newMsgArr.length; i++) {
      if (newMsgArr[i] !== "") {
        if (isMeTurn) {
          newMsgArr[i] = "me: " + newMsgArr[i];
          isMeTurn = false;
        } else {
          newMsgArr[i] = "you: " + newMsgArr[i].replace(/\*/g, "");
          isMeTurn = true;
        }
      }
    }
    newMsgArr.push("");
    newMsgArr.push("you:");
    return newMsgArr.join("\n");
  };
  const getFullLogMessage = (log, logs) => {
    const firstMessage = log.message;
    const replyLogs = getChildrenMatchesOfLog(log, logs);
    const replyMessages = replyLogs.map(replyLog => replyLog.message);
    const parentMessages: any[] = [];
    let currentLog = log;
    while (currentLog) {
      const parentLog = logs.find(log => log && log.reply_log_id === currentLog.id);
      if (parentLog) parentMessages.push(parentLog.message);
      currentLog = parentLog;
    }
    const fullMessage = [parentMessages.reverse(), firstMessage, ...replyMessages].join("\n");
    return fullMessage;
  };
  const customIncludes = (arr, val) => {
    for (let i = 0; i < arr.length; i++) {
      let counter = 0;
      for (let j = 0; j < arr[i].length; j++) {
        if (arr[i][j] === val[j]) counter++;
      }
      if (counter === arr[i].length) return true;
    }
    return false;
  }
  const customEquals = (arr1, arr2) => {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  const handleSearch = async () => {
    if (currUserId) {
      if (searchMessage.length > 0 && updatedLogs.length > 10) {
        setIsGenerating({ ...isGenerating, searchLogs: true });
        const data = await queryVectorDB(userId, searchMessage);
        const inputData = await queryFeedbackVectorDB(userId, data.inputVector)
        let matchToSet = [] as any;
        if (inputData.match) {
          const outputs = [] as any;
          for (let i = 0; i < inputData.match.metadata.outputs.length; i++) {
            outputs.push(unstringifyOutputEmbeddings(inputData.match.metadata.outputs[i]));
          }
          const dislikedMatches = data.scoredVectors.filter(m => customIncludes(outputs, m.values));
          matchToSet = data.scoredVectors.filter(m => !customIncludes(outputs, m.values));
          dislikedMatches.forEach(m => matchToSet.push(m));
        } else {
          matchToSet = data.scoredVectors;
        }
        setRawMatches(matchToSet);
        setMatches(matchToSet.map((m) => updatedLogs?.find((log) => log.message === m.metadata.logMessage)))
        setIsGenerating({ ...isGenerating, searchLogs: false });
        setSearchInputVector(data.inputVector);
      } else if (searchMessage.length === 0) {
        setAlerts([...alerts, { message: `you can not run an empty search`, type: `error` }]);
      } else if (updatedLogs.length === 0) {
        setAlerts([...alerts, { message: `you must enter at least 10 logs to search`, type: `error` }]);
      }
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  }
  const handleTalk = async (log, logs) => {
    if (currUserId) {
      if (talkMode) {
        setTalkMode(false);
        setTalkMessage({ valueToTalkTo: ``, message: `` });
      } else {
        setTalkMode(true);
        setTalkMessage({ valueToTalkTo: getFullLogMessage(log, logs), message: `` });
      }
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  };
  const handleDislike = async (match) => {
    // TODO: turn match to matches (handle general inputs of this type)
    setIsGenerating({ ...isGenerating, dislikeSearch: true });
    const outputString = stringifyOutputEmbeddings(match.values);
    const data = await queryFeedbackVectorDB(userId, searchInputVector);
    if (!data.match) {
      await insertInputIntoFeedbackDB(userId, searchInputVector, [outputString]);
    } else {
      const { outputs } = data.match.metadata as { outputs: string[] };
      await updateFeedbackInput(userId, data.match.id, [...outputs, outputString]);
    }
    setIsGenerating({ ...isGenerating, dislikeSearch: false });
    const matchDisliked = rawMatches?.find((m) => customEquals(match.values, m.values));
    const newMatches: any = rawMatches?.filter((m) => !customEquals(match.values, m.values));
    newMatches.push(matchDisliked);
    setRawMatches(newMatches);
    setMatches(newMatches.map((m) => updatedLogs?.find((log) => log.message === m.metadata.logMessage)));
  };
  useEffect(() => {
    if (!replyMode) {
      if (logMessage.slice(-3, logMessage.length) === "\n\n\n") {
        generateQuestion(logMessage, setlogMessage).then();
      }
    }
  }, [logMessage]);
  useEffect(() => {
    if (replyMode) {
      if (replyMessage.slice(-3, replyMessage.length) === "\n\n\n") {
        generateQuestion(replyMessage, setReplyMessage).then();
      }
    }
  }, [replyMessage]);
  useEffect(() => {
    if (isSearching) {
      if (searchMessage.slice(-3, searchMessage.length) === "\n\n\n") {
        generateQuestion(searchMessage, setSearchMessage).then();
      }
    }
  }, [searchMessage]);
  useEffect(() => {
    if (talkMode && !isGenerating.talkGeneration) {
      if (talkMessage.message.slice(-3, talkMessage.message.length) === "\n\n\n") {
        generateQuestionForTalkToMe().then();
      }
    }
  }, [talkMessage.message]);
  useEffect(() => {
    if (session) {
      const names: any[] = session.user?.name?.split(" ") as any[];
      const id = getUserId(names[0], names[1], session.user?.email);
      id.then((res) => {
        if (res === -1) addUser(names[0], names[1], session?.user?.email);
      });
    }
  }, [currUserId])
  return (
    <Root>
      <Head>
        <title>reinforce</title>
      </Head>
      {
        alerts.map((alert, i) => (
          <Alert key={i} type={alert.type}>
            <>
              {alert.message}
              <button
                onClick={() => handleCloseAlert(i)}
              >
                x
              </button>
            </>
          </Alert>
        ))
      }
      <br />
      <Title onClickAction={() => {
        setIsSearching(!isSearching)
        if (!isSearching) setAlerts([...alerts, { message: `you are now in searching mode`, type: `info` }])
      }} isSearching={isSearching} />
      <div ref={myRef}></div>
      <br />
        <LogBox
          button={
            replyMode
            ?
              <>
                <Button onClickAction={closeReply} isGenerating={isGenerating.addLog}>reply</Button>
                <Button onClickAction={cancelReply} isGenerating={false}>cancel</Button>
              </>
            : isSearching
              ? <Button onClickAction={handleSearch} isGenerating={isGenerating.searchLogs}>search</Button>
              : <Button onClickAction={handleLog} isGenerating={isGenerating.addLog}>log</Button>
          }
          placeholder={
            replyMode
              ? "reply here"
              : isSearching
                ? "what are you lookin for?"
                : "what are u thinking abt?"
          }
          value={
            replyMode
              ? replyMessage
              : isSearching
                ? searchMessage
                : logMessage
          }
          onChange={
            replyMode
              ? (e) => setReplyMessage(`${e.target.value}`)
              : isSearching
                ? (e) => setSearchMessage(`${e.target.value}`)
                : (e) => setlogMessage(`${e.target.value}`)
          }
        />
        <br />
        <br />
        {
          !isSearching
            ? updatedLogs.length !== 0 && getParentMatches(updatedLogs).map((log, logIdx) => {
            return (
              <div key={log.id - 1}>
                <div key={log.id}>
                  <Log
                    key={log.id + 99}
                    isSearching={isSearching}
                    talkMessage={talkMessage}
                    setTalkMessage={setTalkMessage}
                    talkButton={(
                      <LittleButton
                        onClickAction={() => {
                          handleTalk(log, updatedLogs);
                          setTalkMode(!talkMode);
                        }}
                        isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(log.message)}
                        mute={false}>
                        talk
                      </LittleButton>
                    )}
                    talkMode={talkMode}
                    likeButton={(
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                        <LittleButton
                          onClickAction={() => addLikeToLog(log.id, log.num_of_likes)}
                          isGenerating={isGenerating.addLike.id === log.id && isGenerating.addLike.isAdding}
                          mute={false}>
                          <> 
                            {
                              log.num_of_likes !== 0
                                ? log.num_of_likes > 3
                                  ? <>{new Array(log.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)}+</>
                                  : new Array(log.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)
                                : <>🍀?</>
                            }
                          </>
                        </LittleButton>
                      </div>
                    )}
                    logMark="log"
                    replyButton={<LittleButton onClickAction={() => openReply(log.id)} isGenerating={false} mute={log.reply_log_id}>reply</LittleButton>}
                    deleteButton={(
                      <Button
                        onClickAction={() => handleDelete(log.id)}
                        isGenerating={
                          isGenerating.deleteLog.id === log.id && isGenerating.deleteLog.isDeleting
                        }
                      >
                        delete
                      </Button>
                    )}
                    numOfLogs={getParentMatches(updatedLogs).length - (logIdx)}
                    message={log.message}
                    createdAt={log.created_at}
                    isReply={log.is_reply}
                    reply_log_id={log.reply_log_id}
                    choseValueToTalkTo={talkMessage.valueToTalkTo}
                    dislikeButton={null}
                />
              </div>
              <div key={log.id + 1}>
                          {getChildrenMatchesOfLog(log, updatedLogs).map((childLog, childLogIdx) => {
                            return (
                              childLog
                                ? <Log
                                  key={childLog.id}
                                  talkMessage={talkMessage}
                                  isSearching={isSearching}
                                  setTalkMessage={setTalkMessage}
                                  talkButton={(
                                    <LittleButton
                                      onClickAction={() => {
                                        handleTalk(log, updatedLogs);
                                        setTalkMode(!talkMode);
                                      }}
                                      isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(childLog.message)}
                                      mute={false}>
                                      talk
                                    </LittleButton>
                                  )}
                                  likeButton={(
                                    <LittleButton
                                      onClickAction={() => addLikeToLog(childLog.id, childLog.num_of_likes)}
                                      isGenerating={isGenerating.addLike.id === childLog.id && isGenerating.addLike.isAdding}
                                      mute={false}
                                    >
                                      <> 
                                        {
                                          childLog.num_of_likes !== 0
                                            ? childLog.num_of_likes > 3
                                              ? <>{new Array(childLog.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)}+</>
                                              : new Array(childLog.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)
                                            : <>🍀?</>
                                        }
                                      </>
                                    </LittleButton>
                                  )}
                                  talkMode={talkMode}
                                  choseValueToTalkTo={talkMessage.valueToTalkTo}
                                  replyButton={<LittleButton onClickAction={() => openReply(childLog.id)} isGenerating={false} mute={childLog.reply_log_id}>reply</LittleButton>}
                                  deleteButton={(
                                    <Button
                                      onClickAction={() => handleDelete(childLog.id)}
                                      isGenerating={isGenerating.deleteLog.id === childLog.id && isGenerating.deleteLog.isDeleting}
                                    >
                                      delete
                                    </Button>
                                  )}
                                  logMark={"log"}
                                  numOfLogs={`${getParentMatches(updatedLogs).length - logIdx}.${childLogIdx + 1}`}
                                  message={childLog.message}
                                  createdAt={childLog.created_at}
                                  isReply={childLog.is_reply}
                                  reply_log_id={childLog.reply_log_id}
                                  dislikeButton={null} />
                                : null
                            );
                          })}
                        </div>
              </div> 
          )})
          : (
            matches.map((log, logIdx) => {
              return (
                log ?
                <Log
                  key={log.id}
                  isSearching={isSearching}
                  talkMessage={talkMessage}
                  setTalkMessage={setTalkMessage}
                  talkButton={(
                    <LittleButton
                      onClickAction={() => {
                        handleTalk(log, updatedLogs);
                        setTalkMode(!talkMode);
                      }}
                      isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(log.message)}
                      mute={false}>
                      talk
                    </LittleButton>
                  )}
                  likeButton={(
                    <LittleButton
                      onClickAction={() => addLikeToLog(log.id, log.num_of_likes)}
                      isGenerating={isGenerating.addLike.id === log.id && isGenerating.addLike.isAdding}
                      mute={false}
                    >
                      <> 
                        {
                          log.num_of_likes !== 0
                            ? log.num_of_likes > 3
                              ? <>{new Array(log.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)}+</>
                              : new Array(log.num_of_likes).fill(0).map((i, idx) => idx < 3 && <span key={idx} style={{ marginRight: "2px"}}>🍀</span>)
                            : <>🍀?</>
                        }
                      </>
                    </LittleButton>
                  )}
                  talkMode={talkMode}
                  choseValueToTalkTo={talkMessage.valueToTalkTo}
                  replyButton={<LittleButton onClickAction={() => openReply(log.id)} isGenerating={false} mute={log.reply_log_id}>reply</LittleButton>}
                  deleteButton={(
                    <Button
                      onClickAction={() => handleDelete(log.id)}
                      isGenerating={isGenerating.deleteLog.id === log.id && isGenerating.deleteLog.isDeleting}
                    >
                      delete
                    </Button>
                  )}
                  numOfLogs={logIdx + 1}
                  message={log.message}
                  createdAt={log.created_at}
                  isReply={log.is_reply}
                  reply_log_id={log.reply_log_id}
                  logMark={"match"}
                  dislikeButton={(
                    <LittleButton
                      onClickAction={() => handleDislike(rawMatches.find((m) => m.metadata.logMessage === log.message))}
                      isGenerating={isGenerating.dislikeSearch}
                      mute={false}
                    >
                      👎
                    </LittleButton>
                  )} />
                : null
              )
            })
          )
        }
        <br />
    <br />
    <br />
    {
      currUserId && 
      <div style={{ width: "300px", marginLeft: "auto", marginRight: "auto" }}>
        <Button onClickAction={() => signOut()} isGenerating={false}>sign out</Button>
      </div>
    }
    </Root>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  let userId = null;
  let logs = null;
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    const providers = await getProviders();
    return { props: { userId: null, logs: null, providers } };
  } else {
    const names: any[] = session?.user?.name?.split(" ") as any[];
    userId = await getUserId(names[0], names[1], session?.user?.email);
    logs = await getLogsByUserId(userId);
  }
  return { props: { session, userId, logs, providers: null } };
}

export default SnapLog;
