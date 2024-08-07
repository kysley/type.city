import { IconCursorText } from "@tabler/icons-react";
import { Button, Modal, TextField } from "@wwwares/ui-react";
import { useAtom } from "jotai";
import { cursorAtom } from "../state";
import { useState } from "react";

function ChangeCursorButton() {
  const [cursorId, setcursorId] = useAtom(cursorAtom);
  const [newId, setNewId] = useState("");
  return (
    <Modal
      title="Change cursor"
      activator={
        <Button>
          <IconCursorText />
        </Button>
      }
    >
      {({ close }) => (
        <>
          <TextField
            placeholder="0"
            value={newId || cursorId.toString()}
            onChange={(v) => setNewId(v)}
          />
          <Button
            onPress={() => {
              setcursorId(newId);
              setNewId(undefined);
            }}
          >
            Change
          </Button>
        </>
      )}
    </Modal>
  );
}

export { ChangeCursorButton };
