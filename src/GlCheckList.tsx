import { memo, useMemo, useReducer } from "react";
import CheckIcon from "@mui/icons-material/Check";
import { Text } from "onyxia-ui/Text";
import { Markdown } from "onyxia-ui/Markdown";
import { tss } from "./tss";
import { breakpointsValues } from "./theme";
import { useIntersectionObserver } from "./tools/useIntersectionObserver";
import { motion } from "framer-motion";
import { Icon, type IconProps } from "onyxia-ui/Icon";
import { useGuaranteedMemo } from "powerhooks/useGuaranteedMemo";
import { useTheme } from "./theme";

export type GlCheckListProps = {
    className?: string;
    hasAnimation?: boolean;
    classes?: Partial<ReturnType<typeof useStyles>["classes"]>;
    heading?: string;
    subHeading?: string;
    setIconColor?: (colors: ReturnType<typeof useTheme>["colors"]) => {
        iconColor: string;
    };
    icon?: IconProps.Icon;
    elements?: {
        title?: string;
        description?: string;
        iconOverride?: IconProps.Icon;
        setIconColorOverride?: GlCheckListProps["setIconColor"];
        isIconHidden?: boolean;
    }[];
};

const elementWidth = 300;

export const GlCheckList = memo((props: GlCheckListProps) => {
    const {
        className,
        elements,
        heading,
        subHeading,
        hasAnimation,
        icon,
        setIconColor,
    } = props;

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const container = useMemo(() => {
        if (hasAnimation === undefined || !hasAnimation) {
            return undefined;
        }
        return {
            "show": {},
            "hidden": { "opacity": 0 },
        };
    }, [hasAnimation]);

    const listItem = useMemo(() => {
        if (hasAnimation === undefined || !hasAnimation) {
            return undefined;
        }

        return {
            "hidden": {
                "opacity": 0,
                "y": -40,
            },
            "show": {},
        };
    }, [hasAnimation]);

    const { ref } = useIntersectionObserver({
        "callback": ({ observer, entry }) => {
            if (hasAnimation === undefined || !hasAnimation) {
                observer.unobserve(entry.target);
                return;
            }

            if (container === undefined || listItem === undefined) {
                observer.unobserve(entry.target);
                return;
            }

            if (entry.isIntersecting) {
                container.show = {
                    "transition": {
                        "staggerChildren": 0.2,
                    },
                    "opacity": 1,
                };

                listItem.show = {
                    "opacity": 1,
                    "y": 0,
                    "transition": {
                        "duration": 0.6,
                        "ease": "easeOut",
                    },
                };

                observer.unobserve(entry.target);
                forceUpdate();
            }
        },
        "threshold": 0.05,
    });

    const { classes, cx, theme } = useStyles({
        "classesOverrides": props.classes,
    });

    return (
        <section className={cx(classes.root, className)}>
            {(heading !== undefined || subHeading !== undefined) && (
                <div className={classes.headingWrapper}>
                    {heading !== undefined && (
                        <Text
                            className={classes.heading}
                            typo="section heading"
                        >
                            {heading}
                        </Text>
                    )}
                    {subHeading !== undefined && (
                        <Markdown className={classes.subHeading}>
                            {subHeading}
                        </Markdown>
                    )}
                </div>
            )}

            <motion.div
                ref={ref}
                variants={container}
                initial="hidden"
                animate="show"
                className={classes.elements}
            >
                {elements !== undefined &&
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    elements.map(({ setIconColorOverride, ...rest }) => (
                        <motion.div variants={listItem} key={rest.title}>
                            <CheckListElement
                                className={classes.element}
                                classes={{
                                    "checkIcon": classes.checkIcon,
                                    "checkIconWrapper":
                                        classes.checkIconWrapper,
                                    "description": classes.elementDescription,
                                    "title": classes.elementTitle,
                                    "titleAndDescriptionWrapper":
                                        classes.elementTitleAndDescriptionWrapper,
                                }}
                                iconColor={
                                    setIconColor === undefined
                                        ? theme.colors.palette.greenSuccess.main
                                        : setIconColor(theme.colors).iconColor
                                }
                                icon={icon}
                                {...rest}
                            />
                        </motion.div>
                    ))}
            </motion.div>
        </section>
    );
});

const useStyles = tss.withName({ GlCheckList }).create(({ theme }) => ({
    "root": {
        ...theme.spacing.rightLeft("padding", `${theme.paddingRightLeft}px`),
        ...theme.spacing.topBottom("margin", `${theme.spacing(7)}px`),
    },
    "heading": {
        ...(() => {
            const value = "2rem";
            return {
                "fontSize": value,
                "lineHeight": value,
            };
        })(),
    },
    "headingWrapper": {
        "marginBottom": theme.spacing(6),
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
    },
    "elements": {
        "justifyItems":
            theme.windowInnerWidth <= breakpointsValues.sm
                ? undefined
                : "center",
        "display": "grid",
        "columnCount": 3,
        "gridTemplateColumns": `repeat(auto-fit, minmax(min(100%, max(${elementWidth}px, 25%)), 1fr))`,
        "gap": theme.spacing(6),
    },
    "subHeading": {
        ...theme.typography.variants["body 1"].style,
        "color": theme.colors.useCases.typography.textSecondary,
    },
    "element": {},
    "checkIconWrapper": {},
    "checkIcon": {},
    "elementTitleAndDescriptionWrapper": {},
    "elementTitle": {},
    "elementDescription": {},
}));

const { CheckListElement } = (() => {
    type Props = Required<GlCheckListProps>["elements"][number] & {
        className?: string;
        classes?: Partial<ReturnType<typeof useStyles>["classes"]>;
        icon?: IconProps.Icon;
        iconColor: string;
    };

    const CheckListElement = memo((props: Props) => {
        const {
            description,
            title,
            className,
            isIconHidden,
            iconOverride,
            setIconColorOverride,
        } = props;

        const { classes, cx, theme, css } = useStyles({
            "isIconHidden": isIconHidden ?? false,
            "classesOverrides": props.classes,
        });

        const { iconColor } = useGuaranteedMemo((): { iconColor: string } => {
            return {
                "iconColor": (() => {
                    if (setIconColorOverride === undefined) {
                        return props.iconColor;
                    }
                    return setIconColorOverride(theme.colors).iconColor;
                })(),
            };
        }, [setIconColorOverride]);

        return (
            <div className={cx(classes.root, className)}>
                <div className={classes.checkIconWrapper}>
                    <Icon
                        icon={iconOverride ?? props.icon ?? CheckIcon}
                        className={cx(
                            css({
                                "fill": iconColor,
                            }),
                            classes.checkIcon,
                        )}
                    />
                </div>

                <div className={classes.titleAndDescriptionWrapper}>
                    {title !== undefined && (
                        <Markdown className={classes.title}>{title}</Markdown>
                    )}
                    {description !== undefined && (
                        <Markdown className={classes.description}>
                            {description}
                        </Markdown>
                    )}
                </div>
            </div>
        );
    });

    const useStyles = tss
        .withParams<{
            isIconHidden: boolean;
        }>()
        .create(({ theme, isIconHidden }) => ({
            "root": {
                "width":
                    theme.windowInnerWidth >= breakpointsValues.sm
                        ? elementWidth
                        : undefined,
                "display": "flex",
            },
            "checkIcon": {},
            "checkIconWrapper": {
                "paddingTop": theme.spacing(3.5),
                "marginRight": theme.spacing(3),
                "opacity": isIconHidden ? 0 : 1,
            },
            "description": {
                "color": theme.colors.useCases.typography.textSecondary,
                ...theme.typography.variants["body 1"].style,
            },
            "title": {
                ...theme.typography.variants["object heading"].style,
            },
            "titleAndDescriptionWrapper": {},
        }));

    return { CheckListElement };
})();
