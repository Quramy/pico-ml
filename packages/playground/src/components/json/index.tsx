import ReactJson, { ReactJsonViewProps } from "react-json-view";

export type Props = Omit<ReactJsonViewProps, "theme">;

export function JsonViewer(props: Props) {
  return (
    <ReactJson
      {...props}
      theme={{
        base00: "#161821",
        base01: "#1e2132",
        base02: "#45493e",
        base03: "#6b7089",
        base04: "#6b7089",
        base05: "#c6c8d1",
        base06: "#c6c8d1",
        base07: "#c6c8d1",
        base08: "#ceb0b6",
        base09: "#89b8c2",
        base0A: "#84a0c6",
        base0B: "#89b8c2",
        base0C: "#89b8c2",
        base0D: "#84a0c6",
        base0E: "#84a0c6",
        base0F: "#686f9a",
      }}
    />
  );
}
