import { useEffect, useRef } from "react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

import { BehaviorSubject } from "rxjs";
import { skip, debounceTime } from "rxjs/operators";

function getCodeFromURI(defaultValue: string) {
  if (location.hash.startsWith("#code=")) {
    const encoded = location.hash.slice("#code=".length);
    return decompressFromEncodedURIComponent(encoded) as string;
  } else {
    return defaultValue.trim();
  }
}

function replaceHash(newHash: string) {
  const newUri = new URL(location.href);
  newUri.hash = newHash;
  location.replace(newUri.toString());
}

export function useCodeStream(defaultValue: string) {
  const streamRef = useRef(new BehaviorSubject(getCodeFromURI(defaultValue)));
  useEffect(
    () =>
      streamRef.current
        .pipe(skip(1), debounceTime(100))
        .subscribe(code => replaceHash(`code=${compressToEncodedURIComponent(code)}`)).unsubscribe,
    [streamRef.current],
  );
  return streamRef.current;
}
