import LogBox from "../components/log-box/log-box";
import { useState, useEffect, useRef, use } from "react";
import { RiReplyAllLine, RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineDraw } from "react-icons/md";
import { HiMusicNote } from "react-icons/hi";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { SlDislike } from "react-icons/sl";
import { FcCancel } from "react-icons/fc";
import {
  addLog,
  getUserId,
  getLogsByUserId,
  deleteLog,
  addReplyToLog,
  resetReplyLogId,
  addUser,
  addMusicLinkToLog,
} from "../utils/client/db-helpers";
import { signIn, getSession, signOut, useSession } from 'next-auth/react';
import Button from "../components/button/button";
import LittleButton from "../components/little-button/little-button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
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
import Canvas from "../components/canvas/canvas";
import Input from "../components/input/input";
import Root from "../components/root/root";

function SnapLog({ userId, logs }) {
  const sortLogs = (logs) => {
    return logs.slice(0).sort((a, b) => {
      return a.created_at < b.created_at ? 1 : -1;
    });
  };
  const [logMessage, setlogMessage] = useState(``);
  const [isGenerating, setIsGenerating] = useState({ addLog: false, deleteLog: { id: -1, isDeleting: false }, searchLogs: false, dislikeSearch: false, talkGeneration: false });
  const [updatedLogs, setUpdatedLogs] = useState(!logs ? [] : sortLogs([...logs]));
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
  const [drawMode, setDrawMode] = useState(false);
  const [alerts, setAlerts]: any[] = useState([]);
  const [lastLogId, setLastLogId] = useState(null);
  const [addImageToLog, setAddImageToLog] = useState(false);
  const [musicMode, setMusicMode] = useState(false);
  const [musicLink, setMusicLink] = useState(``);
  const logBoxRef: any = useRef(null)
  const replyRef: any = useRef(null)
  const executeScroll = (ref) => ref.current?.scrollIntoView();
  const { data: session } = useSession();
  const signUserIn = async () => {
    await signIn("google");
  };
  const setUserCredentials = async () => {
    const session = await getSession();
    const names: any[] = session?.user?.name?.split(" ") as any[];
    userId = await getUserId(names[0], names[1], session?.user?.email);
    logs = await getLogsByUserId(userId);
    setUpdatedLogs(sortLogs(logs));
    setCurrUserId(userId);
  };
  const formatMusicLink = (link) => {
    const splitLink = link.split("/");
    const videoId = splitLink[splitLink.length - 1];
    return `https://www.youtube.com/embed/${videoId}`;
  };
  const handleLog = async () => {
    if (currUserId) {
      if (logMessage.length > 0) {
        setIsGenerating({ ...isGenerating, addLog: true});
        const newLogId = await addLog(logMessage, userId, false);
        setLastLogId(newLogId);
        const newLogs = await getLogsByUserId(userId);
        setUpdatedLogs(newLogs.slice(0).sort((a, b) => {
          return a.created_at < b.created_at ? 1 : -1;
        }));
        setlogMessage(``);
        setAddImageToLog(true);
        setMusicMode(false);
        setMusicLink(``);
        setDrawMode(false);
        if (musicLink) await addMusicLinkToLog(currUserId, newLogId, formatMusicLink(musicLink));
        setIsGenerating({ ...isGenerating, addLog: false});
      } else {
        setAlerts([...alerts, { message: `you can not log an empty message`, type: `error` }]);
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
      let logToRemove = updatedLogs.filter((log) => log.id === logId)[0];
      let currentLog = logToRemove;
      while (currentLog && currentLog.reply_log_id) {
        await deleteLog(currUserId, currentLog.reply_log_id);
        await resetReplyLogId(currentLog.id);
        currentLog = updatedLogs.filter((log) => log.id === currentLog.reply_log_id)[0];
      }
      await deleteLog(userId, logId);
      updatedLogs.map(async (log) => {
        if (log.reply_log_id === logId) {
          await resetReplyLogId(log.id);
        }
      });
      const newLogs = await getLogsByUserId(userId);
      setUpdatedLogs(sortLogs(newLogs));
      setIsGenerating({ ...isGenerating, deleteLog: { id: -1, isDeleting: false }});
    } else {
      await signUserIn();
      await setUserCredentials();
    }
  };
  const openReply = (logId) => {
    if (currUserId) {
      executeScroll(logBoxRef);
      setReplyMode(true);
      setIdOfLogToReplyTo(logId);
    }
  };
  const closeReply = async () => {
    if (replyMessage.length > 0) {
      setIsGenerating({ ...isGenerating, addLog: true });
      const id = await addLog(replyMessage, userId, true);
      const replyLogId = id;
      setLastLogId(id);
      await addReplyToLog(idOfLogToReplyTo, replyLogId);
      const newLogs = await getLogsByUserId(userId);
      setUpdatedLogs(sortLogs(newLogs));
      executeScroll(replyRef);
      setReplyMode(false);
      setAddImageToLog(true);
      setReplyMessage(``);
      setIdOfLogToReplyTo(null);
      setMatches(matches.slice(0))
      setIsGenerating({ ...isGenerating, addLog: false });
    } else {
      setAlerts([...alerts, { message: `you can not enter an empty reply`, type: `error` }]);
    }
  };
  const cancelReply = () => {
    setReplyMode(false);
    setReplyMessage(``);
    setIdOfLogToReplyTo(null);
    setAddImageToLog(false);
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
    const fullMessage = [parentMessages.reverse(), firstMessage, replyMessages].join("\n");
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
    <Root isSearching={isSearching}>
      <Head>
        <title>reinforce</title>
      </Head>
      <br />
      <br />
      {
        alerts.map((alert, i) => (
          <Alert key={i} type={alert.type}>
            <>
              {alert.message}
              <button
                onClick={() => handleCloseAlert(i)}
              >
                <AiOutlineCloseCircle size="20px" />
              </button>
            </>
          </Alert>
        ))
      }
      <br />
      <Title
        onClickAction={() => {
          setIsSearching(!isSearching)
          if (!isSearching) {
            setAlerts([...alerts, { message: `you are now in searching mode`, type: `info` }])
            setDrawMode(false);
            setMusicMode(false);
          } else {
            setMatches(updatedLogs);
            setRawMatches([]);
            setSearchMessage(``);
            setSearchInputVector([]);
          }
        }}
        isSearching={isSearching}
      />
      <div ref={logBoxRef}></div>
      <br />
        <LogBox
          button={
            replyMode
            ?
              <>
                <LittleButton onClickAction={() => setDrawMode(!drawMode)} isGenerating={false} mute={false}><MdOutlineDraw size="25px" /></LittleButton>
                <LittleButton onClickAction={() => {
                  setMusicMode(!musicMode)
                  setMusicLink(``)
                }} isGenerating={false} mute={false}><HiMusicNote size="25px" /></LittleButton>
                <LittleButton onClickAction={cancelReply} isGenerating={false} mute={false}><FcCancel size="25px" /></LittleButton>
                <Button onClickAction={closeReply} isGenerating={isGenerating.addLog}>reply</Button>
              </>
            : isSearching
              ? <Button onClickAction={handleSearch} isGenerating={isGenerating.searchLogs}>search</Button>
              : (
                  <>
                    <LittleButton onClickAction={() => setDrawMode(!drawMode)} isGenerating={false} mute={false}><MdOutlineDraw size="25px" /></LittleButton>
                    <LittleButton onClickAction={() => {
                      setMusicMode(!musicMode)
                      setMusicLink(``)
                    }} isGenerating={false} mute={false}><HiMusicNote size="25px" /></LittleButton>
                    <div style={{ minWidth: "60px", maxWidth: "60px" }} />
                    <Button onClickAction={handleLog} isGenerating={isGenerating.addLog}>log{" "}{" "}</Button>
                  </>
              )
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
        >
          { drawMode && (
              <>
                {/* <div style={{ height: "10px" }} /> */}
                <Canvas
                  userId={currUserId}
                  logId={lastLogId}
                  saveSelectedImage={addImageToLog}
                  setAddImageToLog={setAddImageToLog}
                />
              </>
          )}
          { musicMode
              && (
                <div style={{ display: "flex", flexDirection: "column", width: "94%" }}>
                  <h3>enter ur music</h3>
                  <Input placeholder="enter youtube url" value={musicLink} onChangeAction={(e) => setMusicLink(e.target.value)} />
                </div>
              ) }
        </LogBox>
        <br />
        <br />
        {
          !isSearching
            ? updatedLogs.length !== 0 && getParentMatches(updatedLogs).map((log, logIdx) => {
            return (
              <div key={log.id - 1}>
                <div key={log.id}>
                  <Log
                    replyRef={!isSearching && idOfLogToReplyTo === log.id ? replyRef : null}
                    musicLink={log.music_url}
                    key={log.id + 99}
                    isSearching={isSearching}
                    talkMessage={talkMessage}
                    setTalkMessage={setTalkMessage}
                    imgURL={log.imgurl}
                    talkButton={(
                      <Button
                        onClickAction={() => {
                          handleTalk(log, updatedLogs);
                          setTalkMode(!talkMode);
                        }}
                        isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(log.message)}
                      >
                        talk
                      </Button>
                    )}
                    talkMode={talkMode}
                    logMark="log"
                    replyButton={<LittleButton onClickAction={() => openReply(log.id)} isGenerating={false} mute={log.reply_log_id}><RiReplyAllLine size="25px" /></LittleButton>}
                    deleteButton={(
                      <LittleButton
                        onClickAction={() => handleDelete(log.id)}
                        isGenerating={
                          isGenerating.deleteLog.id === log.id && isGenerating.deleteLog.isDeleting
                        }
                        mute={false}
                      >
                        <RiDeleteBinLine size="25px" />
                      </LittleButton>
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
                { getChildrenMatchesOfLog(log, updatedLogs).map((childLog, childLogIdx) => {
                  return (
                    childLog
                      && <Log
                        replyRef={!isSearching && idOfLogToReplyTo === childLog.id ? replyRef : null}
                        musicLink={childLog.music_url}
                        key={childLog.id}
                        talkMessage={talkMessage}
                        isSearching={isSearching}
                        imgURL={childLog.imgurl}
                        setTalkMessage={setTalkMessage}
                        talkButton={(
                          <Button
                            onClickAction={() => {
                              handleTalk(log, updatedLogs);
                              setTalkMode(!talkMode);
                            }}
                            isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(childLog.message)}>
                            talk
                          </Button>
                        )}
                        talkMode={talkMode}
                        choseValueToTalkTo={talkMessage.valueToTalkTo}
                        replyButton={<LittleButton onClickAction={() => openReply(childLog.id)} isGenerating={false} mute={childLog.reply_log_id}><RiReplyAllLine size="25px" /></LittleButton>}
                        deleteButton={(
                          <LittleButton
                            onClickAction={() => handleDelete(childLog.id)}
                            isGenerating={isGenerating.deleteLog.id === childLog.id && isGenerating.deleteLog.isDeleting}
                            mute={false}
                          >
                            <RiDeleteBinLine size="25px"/>
                          </LittleButton>
                        )}
                        logMark={"log"}
                        numOfLogs={`${getParentMatches(updatedLogs).length - logIdx}.${childLogIdx + 1}`}
                        message={childLog.message}
                        createdAt={childLog.created_at}
                        isReply={childLog.is_reply}
                        reply_log_id={childLog.reply_log_id}
                        dislikeButton={null} />
                      );
                    })
                  }
            </div>
              </div> 
          )})
          : (
            getParentMatches(matches).map((log, logIdx) => {
              return (
                log &&
                  <>
                    <Log
                      replyRef={isSearching && idOfLogToReplyTo === log.id ? replyRef : null}
                      key={log.id}
                      isSearching={isSearching}
                      musicLink={log.music_url}
                      talkMessage={talkMessage}
                      imgURL={log.imgurl}
                      setTalkMessage={setTalkMessage}
                      talkButton={(
                        <Button
                          onClickAction={() => {
                            handleTalk(log, updatedLogs);
                            setTalkMode(!talkMode);
                          }}
                          isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(log.message)}>
                          talk
                        </Button>
                      )}
                      talkMode={talkMode}
                      choseValueToTalkTo={talkMessage.valueToTalkTo}
                      replyButton={<LittleButton onClickAction={() => openReply(log.id)} isGenerating={false} mute={log.reply_log_id}><RiReplyAllLine size="25px" /></LittleButton>}
                      deleteButton={(
                        <LittleButton
                          onClickAction={() => handleDelete(log.id)}
                          isGenerating={isGenerating.deleteLog.id === log.id && isGenerating.deleteLog.isDeleting}
                          mute={false}
                        >
                          <RiDeleteBinLine size="25px" />
                        </LittleButton>
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
                          <SlDislike size="25px" />
                        </LittleButton>
                      )} />
                    <div key={log.id + 1}>
                { getChildrenMatchesOfLog(log, updatedLogs).map((childLog, childLogIdx) => {
                  return (
                    childLog
                      && <Log
                        replyRef={idOfLogToReplyTo === childLog.id ? replyRef : null}
                        key={childLog.id}
                        talkMessage={talkMessage}
                        musicLink={childLog.music_url}
                        isSearching={isSearching}
                        imgURL={childLog.imgurl}
                        setTalkMessage={setTalkMessage}
                        talkButton={(
                          <Button
                            onClickAction={() => {
                              handleTalk(log, updatedLogs);
                              setTalkMode(!talkMode);
                            }}
                            isGenerating={isGenerating.talkGeneration && talkMessage.valueToTalkTo.includes(childLog.message)}>
                            talk
                          </Button>
                        )}
                        talkMode={talkMode}
                        choseValueToTalkTo={talkMessage.valueToTalkTo}
                        replyButton={<LittleButton onClickAction={() => openReply(childLog.id)} isGenerating={false} mute={childLog.reply_log_id}><RiReplyAllLine size="25px" /></LittleButton>}
                        deleteButton={(
                          <LittleButton
                            onClickAction={() => handleDelete(childLog.id)}
                            isGenerating={isGenerating.deleteLog.id === childLog.id && isGenerating.deleteLog.isDeleting}
                            mute={false}
                          >
                            <RiDeleteBinLine size="25px" />
                          </LittleButton>
                        )}
                        logMark={"match"}
                        numOfLogs={`${logIdx + 1}.${childLogIdx + 1}`}
                        message={childLog.message}
                        createdAt={childLog.created_at}
                        isReply={childLog.is_reply}
                        reply_log_id={childLog.reply_log_id}
                        dislikeButton={null} />
                      );
                    })
                  }
            </div>
                  </>
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
    return { props: { userId: null, logs: null } };
  } else {
    const names: any[] = session?.user?.name?.split(" ") as any[];
    userId = await getUserId(names[0], names[1], session?.user?.email);
    logs = await getLogsByUserId(userId);
  }
  return { props: { session, userId, logs } };
}

export default SnapLog;
