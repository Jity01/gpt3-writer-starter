import styles from './log-box.module.css';

function LogBox({ placeholder, value, onChange, button }) {
  const formatValue = (message: string) => {
    const messageArray = message.split(`\n`);
    const finalMessageChuncks = [];
    messageArray.forEach((chunck) => {
      finalMessageChuncks.push(chunck.replace(/<\/?strong>/g, '**'));
    });
    return finalMessageChuncks.join(`\n`);
  }
  return (
    <div className={styles.container}>
      <div className={styles.parallelogram}>
        <textarea
          placeholder={placeholder}
          value={formatValue(value)}
          onChange={onChange}
        />
        { button }
      </div>
    </div>
  );
}

export default LogBox;