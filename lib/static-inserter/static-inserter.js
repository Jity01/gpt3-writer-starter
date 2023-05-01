import { useEffect } from 'react';

function StaticInserter({ status }) {
  useEffect(() => {
    return () => {
      console.log('unmounted');
    };
  }, [status]);
  return <></>;
}

export default StaticInserter;