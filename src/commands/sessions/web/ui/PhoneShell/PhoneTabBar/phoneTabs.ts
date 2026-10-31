import HistoryIcon from "@mui/icons-material/History";
import ListIcon from "@mui/icons-material/List";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";

export const phoneTabs = [
	{ label: "Sessions", path: "/", Icon: ViewAgendaIcon },
	{ label: "Backlog", path: "/backlog", Icon: ListIcon },
	{ label: "History", path: "/history", Icon: HistoryIcon },
] as const;
