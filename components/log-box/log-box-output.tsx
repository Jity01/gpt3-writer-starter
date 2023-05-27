import styles from './log-box.module.css';

function LogBoxOutput({ outputText }) {
  return (
    <div className="output-container">
      <br />
      <div className="parallelogram">
        <div className="output-container">
          {outputText}
        </div>
      </div>
    </div>
  );
}

export default LogBoxOutput;
