import { Box, Flex } from "@wwwares/ui-system/jsx";

function StatShield(props) {
  return (
    <Flex
      className="shield"
      borderRadius="lg"
      // border="1px solid {colors.zinc.700}"
      border="1px solid {colors.zinc.600}"
      overflow="hidden"
      height="fit-content"
    >
      <Box
        color="white"
        paddingX="3"
        className="title"
        backgroundImage="linear-gradient(180deg, {colors.zinc.400}, {colors.zinc.600})"
        borderRight="1px solid {colors.zinc.600}"
      >
        <span>{props.title}</span>
      </Box>
      <Box
        background="zinc.100"
        flex={1}
        backgroundImage="linear-gradient(180deg, {colors.zinc.100}, {colors.zinc.300})"
        boxShadow="0px -3px 5px {colors.zinc.400} inset"
        paddingX="3"
        color="zinc.900"
      >
        <span>{props.value}</span>
      </Box>
    </Flex>
  );
}

export { StatShield };
