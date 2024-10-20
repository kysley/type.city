import { Card } from "@wwwares/ui-react";
import { Flex } from "@wwwares/ui-system/jsx";
import type { ReactNode } from "react";

type PageProps = {
	children: ReactNode;
	title: string;
};

function Page({ children, title }: PageProps) {
	return (
		<Flex flexDirection="column" justifyContent="center" gridColumn={"2 / -2"}>
			<Flex fontSize="5xl">{title}</Flex>
			{children}
		</Flex>
	);
}

type AnnotatedLayoutProps = {
	children: ReactNode;
	title: string;
};
function AnnotatedLayout({ children, title }: AnnotatedLayoutProps) {
	return (
		<Flex
			gap="5"
			alignSelf="center"
			width="100%"
			justifyContent="space-between"
		>
			<Flex>{title}</Flex>
			<Card width="75%">{children}</Card>
		</Flex>
	);
}

export { Page, AnnotatedLayout };
