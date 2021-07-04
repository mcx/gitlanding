/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta } from "@storybook/react";
import type { Story } from "@storybook/react";
import { useEffect } from "react";
import { symToStr } from "tsafe/symToStr";
import {
    createThemeProvider,
    useIsDarkModeEnabled,
    defaultGetTypography,
} from "onyxia-ui/lib";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { id } from "tsafe/id";
import "onyxia-ui/assets/fonts/work-sans.css";

const { ThemeProvider, useTheme } = createThemeProvider({
    "isReactStrictModeEnabled": false,
    "getTypography": ({ windowInnerWidth }) => ({
        ...defaultGetTypography({ windowInnerWidth }),
        "fontFamily": '"Work Sans", sans-serif',
    }),
});

export function getStoryFactory<Props>(params: {
    wrappedComponent: Record<string, (props: Props) => ReturnType<React.FC>>;
    sectionName?: string;
}) {
    const { sectionName, wrappedComponent } = params;

    const Component: any = Object.entries(wrappedComponent).map(
        ([, component]) => component,
    )[0];

    const Template: Story<Props & { darkMode: boolean; width: number }> = ({
        darkMode,
        width,
        ...props
    }) => {
        const { setIsDarkModeEnabled } = useIsDarkModeEnabled();

        useEffect(() => {
            setIsDarkModeEnabled(darkMode);
        }, [darkMode]);

        const theme = useTheme();

        return (
            <ThemeProvider>
                <Box p={4} style={{ "backgroundColor": "white" }}>
                    <Box clone p={4} m={2} display="inline-block">
                        <Paper
                            style={{
                                "backgroundColor":
                                    theme.colors.useCases.surfaces.background,
                                "width": width !== 0 ? width : undefined,
                            }}
                        >
                            <div
                                style={{
                                    "border": `1px dotted ${theme.colors.useCases.typography.textDisabled}`,
                                }}
                            >
                                <Component {...props} />
                            </div>
                        </Paper>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    };

    function getStory(props: Props): typeof Template {
        const out = Template.bind({});

        out.args = {
            "darkMode": false,
            "width": 0,
            ...props,
        };

        return out;
    }

    return {
        "meta": id<Meta>({
            "title":
                (sectionName !== undefined ? `${sectionName}/` : "") +
                symToStr(wrappedComponent),
            "component": Component,
            // https://storybook.js.org/docs/react/essentials/controls
            "argTypes": {
                "width": {
                    "control": {
                        "type": "range",
                        "min": 0,
                        "max": 1920,
                        "step": 1,
                    },
                },
            },
        }),
        getStory,
    };
}

export function logCallbacks<T extends string>(
    propertyNames: readonly T[],
): Record<T, () => void> {
    const out: Record<T, () => void> = id<Record<string, never>>({});

    propertyNames.forEach(
        propertyName =>
            (out[propertyName] = console.log.bind(console, propertyName)),
    );

    return out;
}