/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import List from "@material-ui/core/List";
import Link from "@material-ui/core/Link";
import { useNamedState } from "powerhooks/useNamedState";
import { useConstCallback } from "powerhooks/useConstCallback";
import { cx } from "tss-react";
import { useClickAway } from "powerhooks/useClickAway";
import { useRef, memo } from "react";
import { GlLogo } from "./GlLogo";
import ReactMarkDown from "react-markdown";
import { Typography } from "onyxia-ui/Typography";
import { GlIcon } from "./GlIcon";
import { getThemeApi } from "./theme";
import { useGuaranteedMemo } from "powerhooks";

/*function getSmallDeviceBreakPoint(params: {
    menuRef: React.RefObject<HTMLDivElement>;
    titleRef: React.RefObject<HTMLDivElement>;
}) {
    const { menuRef, titleRef } = params;

    const out = () => {
        const menuWidth = !menuRef.current ? 0 : menuRef.current.clientWidth;

        const titleWidth = !titleRef.current ? 0 : titleRef.current.clientWidth;

        return menuWidth + titleWidth + 200;
    };

    return out();
}*/

export type GlHeaderProps = {
    /**
     * If you use an svg image that does not have a fill,
     * the fill will be set to the current font color,
     * depending on the dark mode being active.
     */
    title?: GlHeaderProps.Title;
    menuItems?: {
        name: string;
        url: string;
    }[];
    className?: string;
};

export declare namespace GlHeaderProps {
    export type Title = Title.Logo | Title.Markdown;

    export namespace Title {
        export type Logo = {
            type: "logo";
            logoUrl: string;
        };

        export type Markdown = {
            type: "markdown";
            markdown: string;
        };
    }
}

const getUseClassNames = () => {
    const { createUseClassNames } = getThemeApi();

    const { useClassNames } = createUseClassNames<{
        mobileMenuHeight: number;
    }>()((theme, { mobileMenuHeight }) => ({
        "root": {
            "display": "flex",
            "justifyContent": "flex-end",
            "flexWrap": "wrap",
            "alignItems": "center",
            "width": "100%",
            "padding": [4.5, 12.5, 4.5, 12.5].map(spacing => `${theme.spacing(spacing)}px`).join(" "),
            ...(theme.responsive.down(1440)
                ? {
                      "padding": [2, 8, 2, 8].map(spacing => `${theme.spacing(spacing)}px`).join(" "),
                  }
                : {}),
        },
        "title": {
            "display": "flex",
            "alignItems": "center",
            "marginRight": "auto",
            "& svg": {
                "height": 50,
                "width": 50,
            },
        },
        "itemWrapper": {
            ...(theme.responsive.down("md")
                ? {
                      "transition": "height 400ms",
                      "order": 3,
                      "flex": "1 0 100%",
                      "textAlign": "left",
                      "height": mobileMenuHeight,
                      "overflow": "hidden",
                      "display": "flex",
                      "flexDirection": "column",
                  }
                : {}),
        },
        "link": {
            "color": theme.isDarkModeEnabled ? "white" : "black",
            "fontSize": "22px",
            "lineHeight": "32px",
            "marginLeft": theme.spacing(8),
            ...(theme.responsive.down(1440)
                ? {
                      "marginLeft": theme.spacing(3),
                  }
                : {}),
        },

        "unfold": {
            "order": 2,
            "marginLeft": 10,
            "display": "none",
            "cursor": "pointer",
            ...(theme.responsive.down("md")
                ? {
                      "display": "flex",
                      "alignItems": "center",
                  }
                : {}),
        },
    }));

    return { useClassNames };
};

export const GlHeader = memo((props: GlHeaderProps) => {
    const { menuItems, title, className } = props;

    const { mobileMenuHeight, setMobileMenuHeight } = useNamedState("mobileMenuHeight", 0);

    const { rootRef } = useClickAway(() => setMobileMenuHeight(0));

    const titleRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = useConstCallback(() => {
        if (mobileMenuHeight !== 0) {
            setMobileMenuHeight(0);
            return;
        }

        const menuItems = document.getElementsByClassName("menu-item");

        const newHeight =
            (parseInt(getComputedStyle(menuItems[0]).marginTop.replace("px", "")) +
                parseInt(getComputedStyle(menuItems[0]).marginBottom.replace("px", "")) +
                menuItems[0].clientHeight) *
            menuItems.length;

        setMobileMenuHeight(newHeight);
    });

    const { useClassNames } = useGuaranteedMemo(() => getUseClassNames(), []);

    const { classNames } = useClassNames({
        mobileMenuHeight,
    });

    return (
        <List className={cx(classNames.root, className)} component="nav">
            {title !== undefined && (
                <div ref={titleRef} className={classNames.title}>
                    {(() => {
                        switch (title.type) {
                            case "logo":
                                return <GlLogo logoUrl={title.logoUrl} />;
                            case "markdown":
                                return (
                                    <Typography variant="h3">
                                        <ReactMarkDown>{title.markdown}</ReactMarkDown>
                                    </Typography>
                                );
                        }
                    })()}
                </div>
            )}
            <div ref={menuRef} className={classNames.itemWrapper}>
                {menuItems !== undefined &&
                    menuItems.map(item => (
                        <Link
                            className={cx(classNames.link, "menu-item")}
                            href={item.url}
                            key={JSON.stringify(item.name + item.url)}
                        >
                            {item.name}
                        </Link>
                    ))}
            </div>

            <div ref={rootRef} className={classNames.unfold}>
                <GlIcon id="dehaze" onClick={toggleMobileMenu} />
            </div>
        </List>
    );
});