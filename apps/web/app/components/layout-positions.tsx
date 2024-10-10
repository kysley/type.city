import { Box, Flex } from "@wwwares/ui-system/jsx";
import { ReactNode } from "react";

function CoreGrid({ children }: { children: ReactNode }) {
	return (
		<Flex
			justifyContent="center"
			alignItems="center"
			width="100%"
			height="100%"
			overflow="hidden"
			flexDirection="column"
			display="grid"
			gridTemplateColumns="repeat(10, 1fr)"
			gridTemplateRows="repeat(10, 1fr)"
		>
			{children}
		</Flex>
	);
}

function Center({ children }: { children: ReactNode }) {
	return (
		<Box
			gridColumn="3 / span 6"
			gridRow="5 / -1"
			maxWidth="980px"
			justifySelf="center"
			// gridRowStart="5"
			height="100%"
		>
			{children}
		</Box>
	);
}

function CenterAbove({ children }: { children: ReactNode }) {
	return (
		<Box
			gridColumn="3 / span 6"
			gridRowStart="4"
			height="100%"
			maxWidth="980px"
			justifySelf="center"
			width="100%"
		>
			{children}
		</Box>
	);
}

function CenterBelow({ children }: { children: ReactNode }) {
	return (
		<Box
			gridColumn="3 / span 6"
			gridRowStart="8"
			height="100%"
			maxWidth="980px"
			justifySelf="center"
		>
			{children}
		</Box>
	);
}

function Top({ children }: { children: ReactNode }) {
	return (
		<Box gridColumn="1 / -1" gridRowStart="1" height="100%">
			{children}
		</Box>
	);
}

const Positions = {
	Top,
	Center,
	CenterAbove,
	CenterBelow,
};

export { Positions, CoreGrid };
