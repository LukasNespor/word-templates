import { FunctionComponent } from "react";
import { CommandBar, Depths, Icon, Stack } from "@fluentui/react";

export interface INavigationProps {
    addTemplate: () => void;
    getHelp: () => void;
}

const Navigation: FunctionComponent<INavigationProps> = ({ addTemplate, getHelp }) => {
    const renderDivider = () => {
        return <div style={{ width: 25 }} />;
    };

    const renderLogo = (): JSX.Element => {
        return (
            <Stack horizontal verticalAlign="center">
                <Icon iconName="WordDocument" style={{ fontSize: 25 }} />
                <div style={{ fontSize: 18, marginLeft: 15 }}>Šablony dokumentů</div>
            </Stack>
        );
    };

    return (
        <div style={{ top: 0, position: "sticky", zIndex: 999, boxShadow: Depths.depth16 }}>
            <CommandBar
                items={[
                    {
                        key: "name",
                        onRender: renderLogo
                    },
                    {
                        key: "divider",
                        onRender: renderDivider
                    },
                    {
                        key: "add",
                        text: "Přidat šablonu",
                        iconProps: {
                            iconName: "Add"
                        },
                        onClick: addTemplate
                    }
                ]}
                farItems={
                    [
                        {
                            key: "help",
                            text: "Jak vytvořit šablonu",
                            iconProps: {
                                iconName: "Help"
                            },
                            onClick: getHelp
                        }
                    ]
                }
            />
        </div>
    );
};

export default Navigation;
