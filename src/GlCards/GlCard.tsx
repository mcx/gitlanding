import type { ReactNode } from "react";
import { memo } from "react";
import { tss } from "../tss";

export type GlCardProps = {
    className?: string;
    children?: ReactNode;
    link?: {
        href: string;
        onClick?: () => void;
    };
};

export const GlCard = memo((props: GlCardProps) => {
    const { children, link, className } = props;

    const { classes, cx } = useStyles();

    return (
        <div
            className={cx(classes.root, className)}
            onClick={
                link?.onClick ??
                (() => (window.location.href = link?.href ?? "#"))
            }
        >
            {children}
        </div>
    );
});

const useStyles = tss.withName({ GlCard }).create(({ theme }) => ({
    "root": {
        "borderRadius": 16,
        "transition": "box-shadow 200ms",
        "margin": theme.spacing(2),
        "boxShadow": theme.shadows[1],
        "backgroundColor": theme.colors.useCases.surfaces.surface1,
        ":hover": {
            "boxShadow": theme.shadows[2],
            "cursor": "pointer",
        },
    },
}));
