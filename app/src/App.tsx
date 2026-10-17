import { type ComponentType, type SVGProps } from "react";
import * as I from "./components/Icons";
import { DATA_VERSION } from "./engine/data";
import { href, sharedLinkBroken, useRoute, type Route } from "./lib";
import Home from "./pages/Home";
import Translate from "./pages/Translate";
import CrossMode from "./pages/CrossMode";
import Settings from "./pages/Settings";
import Navigator from "./pages/Navigator";

interface NavItem {
  route: Route;
  label: string;
  short: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV: NavItem[] = [
  { route: "home", label: "Overview", short: "Home", icon: I.Home },
  { route: "translate", label: "Device Translator", short: "Translate", icon: I.Swap },
  { route: "crossmode", label: "Cross-Mode", short: "Cross-mode", icon: I.Layers },
  { route: "settings", label: "Initial Settings", short: "Settings", icon: I.Sliders },
  { route: "navigator", label: "NIV Navigator", short: "Navigator", icon: I.Compass },
];

export default function App() {
  const route = useRoute();
  const links = (cls: string, short: boolean) => (
    <nav className={cls} aria-label="Tools">
      {NAV.map((n) => (
        <a key={n.route} href={href(n.route)} aria-current={route === n.route ? "page" : undefined}>
          <n.icon />
          {short ? n.short : n.label}
        </a>
      ))}
    </nav>
  );

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#/">
          <I.Logo />
          <span>
            Ventara<small>CLINICAL</small>
          </span>
        </a>
        {links("topnav", false)}
        <span className="data-pill" title="Device reference data version">
          <span className="dot" /> Data {DATA_VERSION}
        </span>
      </header>

      <main className="main">
        {sharedLinkBroken() && (
          <div className="notice bad" role="alert" style={{ marginBottom: 12 }}>
            <I.Alert />
            <span>This link is incomplete — the settings in it couldn't be read. Ask for the link again, or scan the QR code instead.</span>
          </div>
        )}
        {route === "home" && <Home />}
        {route === "translate" && <Translate />}
        {route === "crossmode" && <CrossMode />}
        {route === "settings" && <Settings />}
        {route === "navigator" && <Navigator />}
      </main>

      {links("tabbar", true)}
    </>
  );
}
