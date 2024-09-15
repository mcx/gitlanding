/* eslint-disable @typescript-eslint/no-namespace */
import { memo, useEffect, useState } from "react";
import { Button } from "onyxia-ui/Button";
import { tss } from "../tss";
import { Text } from "onyxia-ui/Text";
import { GlCard } from "./GlCard";
import type { GlCardProps } from "./GlCard";
import { breakpointsValues } from "../theme";
import { useDomRect } from "powerhooks/useDomRect";

export type GlProjectCardProps = GlCardProps & {
    projectImageUrl: string;
    badgeLabel?: string;
    badgeColor?: string;
    badgeBackgroundColor?: string;
    title: string;
    subtitle?: string;
    text?: string;
    classes?: Partial<ReturnType<typeof useStyles>["classes"]>;
};

export const GlProjectCard = memo((props: GlProjectCardProps) => {
    const {
        className,
        text,
        projectImageUrl,
        subtitle,
        title,
        badgeLabel,
        link,
        badgeBackgroundColor,
        badgeColor,
    } = props;

    const [imgAspectRatio, setImgAspectRatio] = useState<number | undefined>(
        undefined,
    );

    const {
        ref: headerRef,
        domRect: { width: headerWidth },
    } = useDomRect();

    const img = new Image();

    useEffect(() => {
        img.src = projectImageUrl;
        img.onload = () => {
            setImgAspectRatio(img.height / img.width);
        };
    }, [projectImageUrl]);

    const { classes, cx } = useStyles({
        badgeColor,
        badgeBackgroundColor,
        projectImageUrl,
        headerWidth,
        imgAspectRatio,
        "classesOverrides": props.classes,
    });

    return (
        <GlCard link={link} className={cx(classes.root, className)}>
            <div ref={headerRef} className={classes.header}>
                {badgeLabel !== undefined && (
                    <Button
                        type="submit"
                        className={classes.button}
                        variant="ternary"
                        href={link?.href}
                        onClick={link?.onClick}
                    >
                        {badgeLabel}
                    </Button>
                )}
            </div>
            <div className={classes.footer}>
                <Text typo="object heading" className={classes.footerTitle}>
                    {title}
                </Text>
                {subtitle !== undefined && (
                    <Text typo="label 2" className={classes.footerSubtitle}>
                        {subtitle}
                    </Text>
                )}
                {text !== undefined && (
                    <Text className={classes.footerText} typo="label 2">
                        {text}
                    </Text>
                )}
            </div>
        </GlCard>
    );
});

const useStyles = tss
    .withName({ GlProjectCard })
    .withParams<
        Pick<
            GlProjectCardProps,
            "badgeBackgroundColor" | "badgeColor" | "projectImageUrl"
        > & {
            headerWidth: number;
            imgAspectRatio: number | undefined;
        }
    >()
    .create(
        ({
            theme,
            badgeBackgroundColor,
            badgeColor,
            projectImageUrl,
            headerWidth,
            imgAspectRatio,
        }) => ({
            "root": {
                "transition": "opacity 300ms",
                "opacity":
                    headerWidth === 0 || imgAspectRatio === undefined ? 0 : 1,
                "display": "flex",
                "flexDirection": "column",
                "overflow": "hidden",
                "margin": (() => {
                    if (theme.windowInnerWidth >= breakpointsValues.lg) {
                        return undefined;
                    }

                    return theme.spacing(1);
                })(),
            },

            "footer": {
                "flex": 1,
                "backgroundColor": theme.isDarkModeEnabled
                    ? theme.colors.palette.dark.greyVariant1
                    : theme.colors.palette.light.light,
                "padding": [4, 5, 4, 5]
                    .map(spacing => `${theme.spacing(spacing)}px`)
                    .join(" "),
            },

            "footerTitle": {
                "marginBottom": theme.spacing(1),
            },

            "footerSubtitle": {
                "marginBottom": theme.spacing(1),
            },

            "header": {
                "width": "100%",
                "margin": 0,
                "background": `url("${projectImageUrl}")`,
                "minHeight":
                    imgAspectRatio === undefined
                        ? undefined
                        : headerWidth * imgAspectRatio,
                "backgroundSize": "cover",
                "backgroundPosition": "center",
                "display": "flex",
                "justifyContent": "flex-end",
                "alignItems": "flex-start",
                "padding": theme.spacing(3),
            },

            "button": {
                "marinLeft": theme.spacing(7),
                "border": "none",
                "backgroundColor": badgeBackgroundColor ?? undefined,
                "color": (() => {
                    if (badgeColor !== undefined) {
                        return `${badgeColor} !important`;
                    }

                    return undefined;
                })(),
            },
            "footerText": {},
        }),
    );
