import {
  Button,
  Modal,
  Radio,
  RadioGroup,
  SegmentedControlGroup,
  SegmentedControlOption,
} from "@wwwares/ui-react";
import { Flex } from "@wwwares/ui-system/jsx";
import { useState } from "react";
import { ClientEvents, GameMode } from "types";
import { useSocket } from "../../hooks/use-socket";

function CreateMpGameModalButton() {
  const [gameMode, setGameMode] = useState(GameMode.LIMIT);
  const [condition, setCondition] = useState(30);

  const { socket } = useSocket();

  return (
    <Modal
      // defaultOpen
      title="Start a game"
      activator={<Button>Multiplayer</Button>}
      tertiaryAction="&nbsp;"
      secondaryAction=<Button>Cancel</Button>
      primaryAction={
        <Button
          intent="primary"
          onPress={() =>
            socket.emit(ClientEvents.ROOM_CREATE, { mode: gameMode, condition })
          }
        >
          Create
        </Button>
      }
    >
      {({ close }) => (
        <Flex flexDirection="column" gap="5">
          <SegmentedControlGroup
            defaultValue={gameMode.toString()}
            onChange={(v) => {
              setGameMode(Number(v));
              setCondition(Number(v) === GameMode.LIMIT ? 30 : 25);
            }}
          >
            <SegmentedControlOption
              title="Time limit"
              value={GameMode.LIMIT.toString()}
            />
            <SegmentedControlOption
              title="Number of words"
              value={GameMode.RACE.toString()}
            />
          </SegmentedControlGroup>
          {gameMode === GameMode.LIMIT && (
            <RadioGroup
              label="Duration"
              value={condition.toString()}
              onChange={(v) => setCondition(Number(v))}
            >
              <Radio label="15 seconds" value={"15"}>
                15 seconds
              </Radio>
              <Radio label="30 seconds" value={"30"}>
                30 seconds
              </Radio>
              <Radio label="60 seconds" value={"60"}>
                60 seconds
              </Radio>
            </RadioGroup>
          )}
          {gameMode === GameMode.RACE && (
            <RadioGroup
              label="Number of words"
              value={condition.toString()}
              onChange={(v) => setCondition(Number(v))}
            >
              <Radio label="10 words" value={"10"}>
                10 words
              </Radio>
              <Radio label="25 words" value={"25"}>
                25 words
              </Radio>
              <Radio label="50 words" value={"50"}>
                50 words
              </Radio>
            </RadioGroup>
          )}
        </Flex>
      )}
    </Modal>
  );
}

export { CreateMpGameModalButton };
