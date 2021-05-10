import React, { useRef } from "react";
import { useProgramStream } from "../../hooks/use-program-stream";
export function EvaluatedLog() {
  const arr = useRef<string[]>([]);
  const result = useProgramStream("evaluatedResult$", 0);
  const logs = arr.current;
  if (result.error) {
    logs.push(result.error.message);
  } else {
    logs.push(result.data + "");
  }
  return (
    <ul>
      {logs.map((log, i) => (
        <li key={i}>{log}</li>
      ))}
    </ul>
  );
}
