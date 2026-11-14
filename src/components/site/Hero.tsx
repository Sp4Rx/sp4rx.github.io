import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowDown, Check, Mail } from "lucide-react";
import { resumeData, stack, type Layer } from "@/data/resume";
import { matches, needsText, mailto } from "@/lib/match";
import { PATHS } from "@/constants/paths";

interface Props {
  picked: Layer[];
  toggle: (layer: Layer) => void;
}

function Stack({ picked, toggle }: Props) {
  const scene = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, x: 0, base: 0, spin: 0 });

  const onDown = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = { ...d, down: true, moved: false, x: e.clientX, base: d.spin };
  };

  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    const el = scene.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      // Capturing only once it is a real drag keeps a plain tap as a click on the slab.
      el.setPointerCapture(e.pointerId);
      el.dataset.drag = "true";
    }
    // Clamped so the stack never turns edge-on, where the slabs hide each other.
    d.spin = Math.max(-28, Math.min(28, d.base - dx * 0.4));
    el.style.setProperty("--spin", `${d.spin}deg`);
  };

  const onUp = () => {
    drag.current.down = false;
    if (scene.current) scene.current.dataset.drag = "false";
  };

  return (
    <div
      ref={scene}
      className="stack-scene"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="stack" data-any={picked.length > 0}>
        <div className="stack-sway">
          {/* The checklist is the accessible control; the slabs repeat it for pointer users. */}
          {stack.map((layer, n) => (
            <button
              key={layer.id}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="slab"
              data-on={picked.includes(layer.id)}
              style={{ "--i": stack.length - 1 - n } as CSSProperties}
              onClick={() => toggle(layer.id)}
            >
              <span className="slab-label">
                {String(n + 1).padStart(2, "0")} {layer.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero({ picked, toggle }: Props) {
  const { basics, projects, work } = resumeData;
  const count = [...projects, ...work].filter((item) => matches(item, picked)).length;

  return (
    <section className="mx-auto grid max-w-6xl gap-x-12 gap-y-6 px-4 pb-16 pt-8 sm:px-6 md:grid-cols-2 md:items-center md:pt-14">
      <div className="md:col-start-1 md:row-start-1">
        <p className="label mb-4">{basics.designation} · 9 years</p>
        <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          What do you need built?
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Tick the pieces. I'll show you where I've already shipped them.
        </p>
      </div>

      <div className="md:col-start-2 md:row-span-2 md:row-start-1">
        <Stack picked={picked} toggle={toggle} />
        <p className="label mt-2 text-center">Tap a layer · drag to turn</p>
      </div>

      <div className="md:col-start-1 md:row-start-2">
        <ul className="border-t border-foreground">
          {stack.map((layer, n) => {
            const on = picked.includes(layer.id);
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(layer.id)}
                  className={`flex min-h-14 w-full items-center gap-3 border-b border-foreground px-2 py-2 text-left transition-colors hover:bg-secondary ${on ? "bg-secondary" : ""}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border border-foreground ${on ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    {on && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-semibold leading-tight">{layer.need}</span>
                    <span className="block text-sm text-muted-foreground">{layer.tech}</span>
                  </span>
                  <span className="label">{String(n + 1).padStart(2, "0")}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div aria-live="polite" className="mt-5">
          {picked.length > 0 ? (
            <p className="text-lg">
              <strong>{needsText(picked)}.</strong>{" "}
              {count} of my projects and roles {count === 1 ? "covers" : "cover"} all of it.
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">Nothing ticked yet. All my work is below either way.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={mailto(basics.email, picked)} className="btn btn-accent">
              <Mail className="h-4 w-4" />
              {picked.length > 0 ? "Email me about this" : "Email me"}
            </a>
            <a href="#work" className="btn">
              <ArrowDown className="h-4 w-4" />
              {picked.length > 0 ? "Show the matches" : "See the work"}
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Hiring for a role? <a href="#resume" className="link text-foreground">Skip to the resume</a> or{" "}
          <a href={PATHS.PDF.BROWSER_PATH} download="Suvajit_Sarkar_Resume.pdf" className="link text-foreground">download the PDF</a>.
        </p>
      </div>
    </section>
  );
}
