import LoadingScreen from './LoadingScreen';
import RaceFocus from './RaceFocus';
import ChampionshipHero, { HouseResultCards } from './ChampionshipHero';
import ArenaEffects from './ArenaEffects';
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Check,
  Crown,
  Flame,
  Swords,
  Zap,
  Clock3,
  MapPin,
  ChevronRight,
  CircleHelp,
  Download,
  Flag,
  LockKeyhole,
  Menu,
  Medal,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  getHouse,
  getStandings,
  houses,
} from "./data";

import { AnimatedScore, MotionEffects } from "./visuals";
import ScorePublisher from "./ScorePublisher";
import useScoreboard from "./useScoreboard";
import { INITIAL_REVISION } from "./score-service";

const STORE_KEY = "bcg-sportmeet-2027-v1";
const cleanResult = (result) => ({
  houseId: houses.some((h) => h.id === result.houseId)
    ? result.houseId
    : "parakrama",
  athlete: String(result.athlete || ""),
  place: Number(result.place) || 1,
  points: Number(result.points) || 0,
});
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.events) && saved.adjustments) return {...saved,baseRevision:saved.baseRevision || INITIAL_REVISION};
  } catch {
    /* use sample data */
  }
  return null;
}
function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function HouseCrest({ house, size = 28 }) {
  const Icon = { parakrama: Crown, gemunu: Swords, thissa: Flame, vijaya: Zap }[
    house.id
  ];
  return (
    <span className="house-crest" style={{ "--house": house.color }}>
      <Icon size={size} strokeWidth={1.7} />
    </span>
  );
}
function Brand() {
  return (
    <Link to="/" className="brand" aria-label="BCG Sports Meet home">
      <span className="brand-mark">
        <span>B</span>
        <small>BCG</small>
      </span>
      <span className="brand-copy">
        <strong>BANDARANAYAKE</strong>
        <small>COLLEGE · GAMPAHA</small>
      </span>
    </Link>
  );
}
function Header({ onSearch, leader }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  function submit(e) {
    e.preventDefault();
    onSearch(search);
    setSearch("");
    setOpen(false);
  }
  return (
    <>
      <div className="utility-bar">
        <div className="container">
          <span>
            <MapPin size={12} /> GAMPAHA, SRI LANKA
          </span>
          <span className="utility-motto">
            <i className="theme-status-dot" /> {leader.name.toUpperCase()} SETS
            THE PACE · {leader.points} PTS
          </span>
          <span
            className="house-colours"
            aria-label="Yellow, green, red, and blue houses"
          >
            {houses.map((h) => (
              <i key={h.id} style={{ background: h.color }} />
            ))}
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={open ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            <NavLink to="/" end onClick={() => setOpen(false)}>
              Overview
            </NavLink>
            <NavLink to="/standings" onClick={() => setOpen(false)}>
              Standings
            </NavLink>
            <NavLink to="/events" onClick={() => setOpen(false)}>
              Events
            </NavLink>
            <NavLink to="/results" onClick={() => setOpen(false)}>
              Results
            </NavLink>
          </nav>
          <form className="header-search" onSubmit={submit}>
            <Search size={17} />
            <input
              aria-label="Search events"
              placeholder="Search the meet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="Submit search" type="submit">
              <ArrowUpRight size={16} />
            </button>
          </form>
          <span className="header-edition">
            20<strong>27</strong>
          </span>
          <button
            className="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <p>
            Different colours.
            <br />
            <strong>The same unbreakable spirit.</strong>
          </p>
          <div className="footer-links">
            <Link to="/standings">
              House standings <ArrowUpRight size={14} />
            </Link>
            <Link to="/events">
              The programme <ArrowUpRight size={14} />
            </Link>
            <Link to="/results">
              Event results <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          BANDARANAYAKE.
        </div>
        <div className="footer-bottom">
          <span>SPORTS MEET 2027 · GAMPAHA, SRI LANKA</span>
          <span>FOUR HOUSES. ONE COLLEGE.</span>
        </div>
      </div>
    </footer>
  );
}
function Eyebrow({ children, light = false }) {
  return (
    <span className={light ? "eyebrow eyebrow-light" : "eyebrow"}>
      <span className="eyebrow-dot" />
      {children}
    </span>
  );
}
function SectionHeading({ eyebrow, title, link, href, description }) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <Link to={href} className="text-link">
          {link}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
function HouseTag({ houseId, small = false }) {
  const house = getHouse(houseId);
  return (
    <span className={small ? "house-tag small" : "house-tag"}>
      <span style={{ background: house.color }} />
      {house.name}
    </span>
  );
}
function StatCard({ icon: Icon, value, label, extra }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={21} />
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
      {extra && <small>{extra}</small>}
    </div>
  );
}
function PointsBar({ standing, max, rank }) {
  return (
    <div className="points-row">
      <span className="rank">{String(rank).padStart(2, "0")}</span>
      <div className="points-house">
        <span className="house-symbol" style={{ background: standing.color }} />
        <div>
          <strong>{standing.name}</strong>
          <small>House</small>
        </div>
      </div>
      <div className="bar-track">
        <span
          style={{
            width: `${Math.max(4, (standing.points / max) * 100)}%`,
            background: standing.color,
          }}
        />
      </div>
      <strong className="points-number">
        <AnimatedScore value={standing.points} />
        <small> pts</small>
      </strong>
    </div>
  );
}
function Status({ value }) {
  return (
    <span
      className={value === "Completed" ? "status completed" : "status upcoming"}
    >
      <span />
      {value}
    </span>
  );
}

function Home({ events, standings, isSample }) {
  const completed = events.filter((e) => e.status === "Completed");
  const next = events.find((e) => e.status !== "Completed");
  const leader = standings[0];
  return (
    <>
      <ChampionshipHero events={events} standings={standings}/>
      <RaceFocus standings={standings} events={events}/>
      <div className="score-ribbon">
        <div className="container">
          {standings.map((house, i) => (
            <Link
              key={house.id}
              to="/standings"
              className="ribbon-house"
              style={{ "--house": house.color }}
            >
              <span className="ribbon-rank">0{i + 1}</span>
              <HouseCrest house={house} />
              <div>
                <span>{house.name}</span>
                <small>
                  {i === 0
                    ? "LEADING THE WAY"
                    : `${leader.points - house.points} POINTS BEHIND`}
                </small>
              </div>
              <strong>
                <AnimatedScore value={house.points} />
                <small>PTS</small>
              </strong>
            </Link>
          ))}
        </div>
      </div>
      <section className="section championship-section">
        <div className="container">
          <SectionHeading
            eyebrow="THE CHAMPIONSHIP RACE"
            title={
              <>
                The podium<em>.</em>
              </>
            }
            link="Explore full standings"
            href="/standings"
          />
          <div className="championship-grid">
            <div className="podium-feature">
              <div className="feature-label">
                <span>
                  <Trophy size={16} /> THE PODIUM
                </span>
                <span>2027</span>
              </div>
              <Podium standings={standings} />
              <div className="podium-caption">THE RACE TO THE TOP IS ON.</div>
            </div>
            <div className="standings-panel">
              <div className="panel-top">
                <span>HOUSE STANDINGS</span>
                <span className="demo-badge">{isSample ? "DEMO SCORES" : "PUBLISHED SCORES"}</span>
              </div>
              {standings.map((standing, i) => (
                <PointsBar
                  key={standing.id}
                  standing={standing}
                  rank={i + 1}
                  max={leader.points || 1}
                />
              ))}
              <div className="panel-bottom">
                <span>
                  {completed.length} OF {events.length} EVENTS COMPLETE
                </span>
                <Link to="/results">
                  View results <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="completion-track">
                <span
                  style={{
                    width: `${events.length ? (completed.length / events.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="meet-numbers">
            <div>
              <strong>04</strong>
              <span>
                HOUSES.
                <br />
                ONE CHAMPIONSHIP.
              </span>
            </div>
            <div>
              <strong>{String(events.length).padStart(2, "0")}</strong>
              <span>
                EVENTS.
                <br />
                ENDLESS POSSIBILITIES.
              </span>
            </div>
            <div>
              <strong>{String(completed.length).padStart(2, "0")}</strong>
              <span>
                EVENTS COMPLETE.
                <br />
                MORE GLORY TO COME.
              </span>
            </div>
            <div>
              <strong>{standings.reduce((n, h) => n + h.points, 0)}</strong>
              <span>
                POINTS AWARDED.
                <br />
                EVERY EFFORT COUNTS.
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section latest-section">
        <div className="container">
          <SectionHeading
            eyebrow="FROM THE FINISH LINE"
            title={
              <>
                THE LATEST <em>VICTORIES.</em>
              </>
            }
            link="All event results"
            href="/results"
          />
          <div className="latest-grid">
            {completed
              .slice(-3)
              .reverse()
              .map((event, i) => {
                const winner = [...event.results].sort(
                  (a, b) => a.place - b.place,
                )[0];
                const house = winner ? getHouse(winner.houseId) : null;
                return (
                  <Link
                    className="latest-card"
                    to={`/results?event=${event.id}`}
                    key={event.id}
                    style={{ "--house": house?.color || "#f2c94c" }}
                  >
                    <div className="latest-top">
                      <span>
                        {event.category.toUpperCase()} /{" "}
                        {event.division.toUpperCase()}
                      </span>
                      <ArrowUpRight size={19} />
                    </div>
                    <h3>{event.name}</h3>
                    <div className="latest-winner">
                      <span className="winner-medal">
                        <Medal size={24} />
                      </span>
                      <div>
                        <small>FIRST PLACE</small>
                        <strong>{winner?.athlete || "Results pending"}</strong>
                        <span>{house?.name} House</span>
                      </div>
                    </div>
                    <div className="latest-bottom">
                      <Status value="Completed" />
                      <span>{event.time}</span>
                    </div>
                  </Link>
                );
              })}
            {completed.length === 0 && (
              <div className="empty-state">
                <Flag />
                <h3>The best is yet to come.</h3>
                <p>Results will appear as events finish.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="section houses-section">
        <div className="container">
          <SectionHeading
            eyebrow="PICK YOUR COLOUR. FEEL THE PRIDE."
            title={
              <>
                FOUR HOUSES.
                <br />
                <em>ONE UNBREAKABLE BOND.</em>
              </>
            }
            description="Rivals on the track. Brothers beyond it. This is the spirit of Bandaranayake."
          />
          <div className="house-grid">
            {houses.map((house, i) => (
              <Link
                to="/standings"
                className="house-card"
                key={house.id}
                style={{ "--house": house.color, "--house-pale": house.pale }}
              >
                <div className="house-card-top">
                  <span>HOUSE / 0{i + 1}</span>
                  <ArrowUpRight size={19} />
                </div>
                <div className="house-emblem">
                  <HouseCrest house={house} size={70} />
                </div>
                <span className="house-ghost" aria-hidden="true">
                  {house.name[0]}
                </span>
                <div className="house-card-copy">
                  <h3>{house.name}</h3>
                  <p>{house.motto}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="next-event-section">
        <div className="container next-event-inner">
          <div className="next-event-intro">
            <Eyebrow light>THE NEXT CHAPTER</Eyebrow>
            <h2>
              READY.
              <br />
              SET. <em>GO.</em>
            </h2>
          </div>
          <div className="next-event-details">
            <span className="next-event-label">UP NEXT ON THE PROGRAMME</span>
            <h3>{next?.name || "All events complete"}</h3>
            <p>
              {next
                ? `${next.division} · ${next.category}`
                : "Every finish is a new beginning."}
            </p>
            <span className="next-event-time">
              <Clock3 size={18} />
              {next?.time || "View the results"}
            </span>
          </div>
          <Link className="button button-lime" to="/events">
            FULL PROGRAMME <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <div className="sample-note container">
        <span className="demo-badge">{isSample ? "DEMO SCORES" : "PUBLISHED SCORES"}</span> {isSample ? "Sample results are shown until the first scores are published." : "One shared scoreboard. Updates appear automatically for everyone."}
      </div>
    </>
  );
}

function PageHero({ eyebrow, title, description, icon: Icon }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <div>
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="page-hero-icon">
          <Icon size={110} strokeWidth={0.8} />
        </div>
      </div>
    </section>
  );
}
function Podium({ standings }) {
  return (
    <div className="podium" aria-label="Top three houses">
      {[standings[1], standings[0], standings[2]]
        .filter(Boolean)
        .map((house, i) => (
          <div
            className={`podium-item podium-${i}`}
            key={house.id}
            style={{ "--house": house.color }}
          >
            <div className="podium-house">
              {i === 1 && <Crown className="leader-crown" size={23} />}
              <HouseCrest house={house} size={30} />
              <strong>{house.name}</strong>
              <span className="podium-score">
                <AnimatedScore value={house.points} />
                <small>PTS</small>
              </span>
            </div>
            <div className="podium-block">
              <span>{i === 1 ? "01" : i === 0 ? "02" : "03"}</span>
              <small>
                {i === 1 ? "LEADING" : i === 0 ? "SECOND" : "THIRD"}
              </small>
            </div>
          </div>
        ))}
    </div>
  );
}
function Standings({ events, standings, isSample }) {
  const max = standings[0]?.points || 1;
  return (
    <>
      <PageHero
        eyebrow="THE HOUSE CHAMPIONSHIP"
        title={
          <>
            Every point <em>matters.</em>
          </>
        }
        description="Watch the race unfold as our four houses compete for the top spot."
        icon={Trophy}
      />
      <div className="sample-note container">
        {isSample ? "Sample standings — official scores will appear when published." : "Published house standings. New scores appear automatically."}
      </div>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="ON THE PODIUM"
            title={
              <>
                The top <em>three.</em>
              </>
            }
          />
          <Podium standings={standings} />
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="COMPLETE STANDINGS"
            title={
              <>
                House <em>leaderboard.</em>
              </>
            }
            description="Points include event results and house score adjustments."
          />
          <div className="standings-full">
            <div className="table-head">
              <span>RANK / HOUSE</span>
              <span>PROGRESS</span>
              <span>EVENT PTS</span>
              <span>OTHER PTS</span>
              <span>TOTAL</span>
            </div>
            {standings.map((s, i) => (
              <div className="standing-full-row" key={s.id}>
                <div className="standing-identity">
                  <span className="standing-rank">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="house-symbol"
                    style={{ background: s.color }}
                  />
                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      {s.wins} event win{s.wins === 1 ? "" : "s"}
                    </small>
                  </div>
                </div>
                <div className="bar-track">
                  <span
                    style={{
                      width: `${(s.points / max) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
                <span>{s.eventPoints}</span>
                <span>{s.otherPoints}</span>
                <strong>
                  <AnimatedScore value={s.points} />
                  <small> pts</small>
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="THE NUMBERS SO FAR"
            title={
              <>
                Built on <em>every effort.</em>
              </>
            }
          />
          <div className="insight-grid">
            <div className="insight-card">
              <Award size={30} />
              <strong>
                {events.filter((e) => e.status === "Completed").length}
              </strong>
              <span>Completed events</span>
            </div>
            <div className="insight-card">
              <Medal size={30} />
              <strong>
                {events.reduce(
                  (sum, e) =>
                    sum + e.results.filter((r) => r.place <= 3).length,
                  0,
                )}
              </strong>
              <span>Podium finishes</span>
            </div>
            <div className="insight-card">
              <Activity size={30} />
              <strong>{standings.reduce((sum, s) => sum + s.points, 0)}</strong>
              <span>Points awarded</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Events({ events }) {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const query = params.get("q") || "";
  const filtered = events.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      `${e.name} ${e.division} ${e.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="THE PROGRAMME"
        title={
          <>
            The stage is <em>set.</em>
          </>
        }
        description="From explosive sprints to defining field events, explore what's happening across the meet."
        icon={Flag}
      />
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="EVENT DIRECTORY"
            title={
              <>
                Find your <em>moment.</em>
              </>
            }
            description={`${events.length} events across track, field, and team competitions.`}
          />
          <div className="filter-row">
            <div className="filter-tabs">
              {["All", "Track", "Field", "Team"].map((item) => (
                <button
                  className={category === item ? "active" : ""}
                  key={item}
                  onClick={() =>
                    setParams((p) => {
                      const next = new URLSearchParams(p);
                      if (item === "All") next.delete("category");
                      else next.set("category", item);
                      return next;
                    })
                  }
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="inline-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) =>
                  setParams((p) => {
                    const next = new URLSearchParams(p);
                    if (e.target.value) next.set("q", e.target.value);
                    else next.delete("q");
                    return next;
                  })
                }
                placeholder="Search events"
              />
            </label>
          </div>
          <div className="event-grid">
            {filtered.map((event, i) => (
              <Link
                to={`/results?event=${event.id}`}
                className="event-card"
                key={event.id}
              >
                <div className="event-card-top">
                  <span className="event-number">
                    EVENT {String(i + 1).padStart(2, "0")}
                  </span>
                  <Status value={event.status} />
                </div>
                <div className="event-icon">
                  <Activity size={28} strokeWidth={1.4} />
                </div>
                <h3>{event.name}</h3>
                <p>{event.division}</p>
                <div className="event-card-footer">
                  <span>
                    {event.category} · {event.time}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No events found</h3>
              <p>Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
function Results({ events, isSample }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("event");
  const [filter, setFilter] = useState("All");
  const listed = events.filter(
    (e) =>
      (filter === "All" || e.status === filter) &&
      (!selected || e.id === selected),
  );
  return (
    <>
      <PageHero
        eyebrow="THE RESULTS DESK"
        title={
          <>
            Moments that <em>count.</em>
          </>
        }
        description="Event by event, see how every house earned its place on the board."
        icon={Medal}
      />
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="EVENT RESULTS BOARD"
            title={
              <>
                Results & <em>finishes.</em>
              </>
            }
            description={isSample ? "Sample results shown until the first scores are published." : "The latest published results, shared with every visitor."}
          />
          <div className="filter-row">
            <div className="filter-tabs">
              {["All", "Completed", "Upcoming"].map((item) => (
                <button
                  key={item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {selected && (
              <button className="clear-filter" onClick={() => setParams({})}>
                Show all events <X size={16} />
              </button>
            )}
          </div>
          <div className="results-list">
            {listed.map((event) => (
              <article className="result-card" key={event.id}>
                <div className="result-card-head">
                  <div>
                    <span className="result-category">
                      {event.category.toUpperCase()} /{" "}
                      {event.division.toUpperCase()}
                    </span>
                    <h3>{event.name}</h3>
                    <span className="result-time">
                      <CalendarDays size={15} />
                      {event.time}
                    </span>
                  </div>
                  <Status value={event.status} />
                </div>
                {event.results.length ? (
                  <><HouseResultCards event={event}/><details className="athlete-details"><summary>Athletes & finishing positions</summary><div className="result-rows">
                    {[...event.results]
                      .sort((a, b) => a.place - b.place)
                      .map((result, i) => (
                        <div
                          className="result-row"
                          key={`${result.houseId}-${i}`}
                        >
                          <span className={`place place-${result.place}`}>
                            {String(result.place).padStart(2, "0")}
                          </span>
                          <HouseTag houseId={result.houseId} />
                          <span className="athlete-name">
                            {result.athlete || "Unnamed athlete"}
                          </span>
                          <strong>
                            +{result.points} <small>PTS</small>
                          </strong>
                        </div>
                      ))}
                  </div></details></>
                ) : (
                  <div className="awaiting-results">
                    <CircleHelp size={19} />
                    Results will appear here after they are entered.
                  </div>
                )}
              </article>
            ))}
            {listed.length === 0 && (
              <div className="empty-state">
                <Medal size={30} />
                <h3>No results found</h3>
                <p>Choose another filter to see more events.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Editor({ events, setEvents, adjustments, setAdjustments, onLock, publishing }) {
  const [tab, setTab] = useState("events");
  const [selectedId, setSelectedId] = useState(events[0]?.id);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const selected = events.find((e) => e.id === selectedId) || events[0];
  function updateEvent(patch) {
    setEvents((items) =>
      items.map((item) =>
        item.id === selected.id ? { ...item, ...patch } : item,
      ),
    );
    setMessage("Draft saved. Publish when you are ready to share these changes.");
  }
  function updateResult(index, patch) {
    updateEvent({
      results: selected.results.map((r, i) =>
        i === index ? cleanResult({ ...r, ...patch }) : r,
      ),
    });
  }
  function addEvent() {
    const event = {
      id: `e${Date.now()}`,
      name: "New Event",
      category: "Track",
      division: "Open Boys",
      status: "Upcoming",
      time: "12:00 PM",
      results: [],
    };
    setEvents((items) => [...items, event]);
    setSelectedId(event.id);
    setTab("events");
    setMessage("New event created.");
  }
  function deleteEvent() {
    if (!window.confirm(`Delete ${selected.name} and all its results?`)) return;
    setEvents((items) => items.filter((e) => e.id !== selected.id));
    setSelectedId(events.find((e) => e.id !== selected.id)?.id);
    setMessage("Event deleted.");
  }
  async function importFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const rows = parseCSV(await file.text());
      const headers = rows.shift()?.map((s) => s.toLowerCase());
      const required = [
        "event",
        "category",
        "division",
        "time",
        "status",
        "house",
        "athlete",
        "place",
        "points",
      ];
      if (!required.every((h) => headers?.includes(h)))
        throw Error(`CSV needs these columns: ${required.join(", ")}`);
      const records = rows.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h, row[i] || ""])),
      );
      const invalid = records.find(
        (r) =>
          !r.event ||
          !houses.some(
            (h) =>
              h.id === r.house.toLowerCase() ||
              h.name.toLowerCase() === r.house.toLowerCase(),
          ) ||
          !Number.isFinite(Number(r.points)) ||
          !Number.isFinite(Number(r.place)),
      );
      if (invalid)
        throw Error(
          "Each row needs an event, valid house, numeric place, and numeric points.",
        );
      setEvents((items) => {
        const next = structuredClone(items);
        for (const r of records) {
          let event = next.find(
            (e) =>
              e.name.toLowerCase() === r.event.toLowerCase() &&
              e.division.toLowerCase() ===
                (r.division || "Open Boys").toLowerCase(),
          );
          if (!event) {
            event = {
              id: `e${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: r.event,
              category: r.category || "Track",
              division: r.division || "Open Boys",
              time: r.time || "TBA",
              status: r.status || "Completed",
              results: [],
            };
            next.push(event);
          }
          const houseId = houses.find(
            (h) =>
              h.id === r.house.toLowerCase() ||
              h.name.toLowerCase() === r.house.toLowerCase(),
          ).id;
          event.status = r.status || "Completed";
          event.category = r.category || event.category;
          event.time = r.time || event.time;
          event.results = event.results.filter((x) => x.houseId !== houseId);
          event.results.push(
            cleanResult({
              houseId,
              athlete: r.athlete,
              place: r.place,
              points: r.points,
            }),
          );
        }
        return next;
      });
      setMessage(
        `Imported ${records.length} score row${records.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }
  function exportCSV() {
    const rows = [
      [
        "event",
        "category",
        "division",
        "time",
        "status",
        "house",
        "athlete",
        "place",
        "points",
      ],
      ...events.flatMap((e) =>
        e.results.map((r) => [
          e.name,
          e.category,
          e.division,
          e.time,
          e.status,
          getHouse(r.houseId).name,
          r.athlete,
          r.place,
          r.points,
        ]),
      ),
    ];
    const content = rows
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    a.download = "bcg-sportmeet-results.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return (
    <div className="editor-shell">
      <div className="editor-top">
        <div className="container">
          <div>
            <Eyebrow light>EDITOR WORKSPACE</Eyebrow>
            <h1>
              Meet control <em>centre.</em>
            </h1>
            <p>
              Manage your draft, preview the standings, then publish scores for everyone.
            </p>
          </div>
          <button className="editor-lock" onClick={onLock}>
            <LockKeyhole size={16} /> Lock editor
          </button>
        </div>
      </div>
      <div className="container editor-body">
        <ScorePublisher {...publishing} />
        <div className="editor-tabs">
          <button
            className={tab === "events" ? "active" : ""}
            onClick={() => setTab("events")}
          >
            <Flag size={17} /> Events & results
          </button>
          <button
            className={tab === "houses" ? "active" : ""}
            onClick={() => setTab("houses")}
          >
            <Trophy size={17} /> House scores
          </button>
          <button
            className={tab === "import" ? "active" : ""}
            onClick={() => setTab("import")}
          >
            <Upload size={17} /> Import / export
          </button>
        </div>
        {message && (
          <div className="editor-message" role="status">
            <Check size={17} />
            {message}
            <button aria-label="Dismiss message" onClick={() => setMessage("")}>
              <X size={15} />
            </button>
          </div>
        )}
        {tab === "events" && (
          <div className="editor-grid">
            <div className="editor-sidebar">
              <div className="editor-side-head">
                <strong>
                  Events <span>{events.length}</span>
                </strong>
                <button onClick={addEvent} aria-label="Add event">
                  <Plus size={18} />
                </button>
              </div>
              <div className="editor-event-list">
                {events.map((e) => (
                  <button
                    className={selected?.id === e.id ? "selected" : ""}
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                  >
                    <span>
                      <strong>{e.name}</strong>
                      <small>{e.division}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="editor-main">
              {selected ? (
                <>
                  <div className="editor-panel-title">
                    <div>
                      <Eyebrow>EVENT DETAILS</Eyebrow>
                      <h2>{selected.name}</h2>
                    </div>
                    <button className="danger-text" onClick={deleteEvent}>
                      <Trash2 size={16} /> Delete event
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Event name
                      <input
                        value={selected.name}
                        onChange={(e) => updateEvent({ name: e.target.value })}
                      />
                    </label>
                    <label>
                      Division
                      <input
                        value={selected.division}
                        onChange={(e) =>
                          updateEvent({ division: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Category
                      <select
                        value={selected.category}
                        onChange={(e) =>
                          updateEvent({ category: e.target.value })
                        }
                      >
                        <option>Track</option>
                        <option>Field</option>
                        <option>Team</option>
                      </select>
                    </label>
                    <label>
                      Status
                      <select
                        value={selected.status}
                        onChange={(e) =>
                          updateEvent({ status: e.target.value })
                        }
                      >
                        <option>Upcoming</option>
                        <option>Completed</option>
                      </select>
                    </label>
                    <label>
                      Start time
                      <input
                        value={selected.time}
                        onChange={(e) => updateEvent({ time: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="results-editor-head">
                    <div>
                      <h3>Event results</h3>
                      <p>Points here feed directly into the leaderboard.</p>
                    </div>
                    <button
                      className="button button-dark"
                      onClick={() =>
                        updateEvent({
                          results: [
                            ...selected.results,
                            {
                              houseId: "parakrama",
                              athlete: "",
                              place: selected.results.length + 1,
                              points: 0,
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={16} /> Add result
                    </button>
                  </div>
                  <div className="result-edit-list">
                    {selected.results.length === 0 && (
                      <p className="no-edit-results">
                        No results yet. Add a result to start scoring.
                      </p>
                    )}
                    {selected.results.map((r, i) => (
                      <div
                        className="result-edit-row"
                        key={`${selected.id}-${i}`}
                      >
                        <label>
                          Place
                          <input
                            type="number"
                            min="1"
                            value={r.place}
                            onChange={(e) =>
                              updateResult(i, { place: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          House
                          <select
                            value={r.houseId}
                            onChange={(e) =>
                              updateResult(i, { houseId: e.target.value })
                            }
                          >
                            {houses.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Athlete / team
                          <input
                            value={r.athlete}
                            onChange={(e) =>
                              updateResult(i, { athlete: e.target.value })
                            }
                            placeholder="Name"
                          />
                        </label>
                        <label>
                          Points
                          <input
                            type="number"
                            min="0"
                            value={r.points}
                            onChange={(e) =>
                              updateResult(i, { points: e.target.value })
                            }
                          />
                        </label>
                        <button
                          className="remove-result"
                          aria-label="Remove result"
                          onClick={() =>
                            updateEvent({
                              results: selected.results.filter(
                                (_, index) => i !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <Flag size={30} />
                  <h3>No events yet</h3>
                  <p>Add an event to begin.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "houses" && (
          <div className="editor-main standalone">
            <div className="editor-panel-title">
              <div>
                <Eyebrow>HOUSE SCORE ADJUSTMENTS</Eyebrow>
                <h2>Additional points</h2>
                <p>
                  Use these for points earned outside the listed event results.
                </p>
              </div>
            </div>
            <div className="house-edit-grid">
              {houses.map((h) => (
                <div
                  className="house-edit-card"
                  key={h.id}
                  style={{ "--house": h.color }}
                >
                  <div className="house-edit-head">
                    <span
                      className="house-symbol"
                      style={{ background: h.color }}
                    />
                    <strong>{h.name}</strong>
                  </div>
                  <label>
                    Additional points
                    <input
                      type="number"
                      min="0"
                      value={adjustments[h.id] ?? 0}
                      onChange={(e) => {
                        setAdjustments((a) => ({
                          ...a,
                          [h.id]: Number(e.target.value) || 0,
                        }));
                        setMessage("House points saved to your private draft.");
                      }}
                    />
                  </label>
                  <small>Added to event points in the standings.</small>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "import" && (
          <div className="editor-main standalone">
            <div className="editor-panel-title">
              <div>
                <Eyebrow>DATA MANAGEMENT</Eyebrow>
                <h2>Import & export results</h2>
                <p>
                  Upload score rows in CSV format or download the current event
                  results.
                </p>
              </div>
            </div>
            <div className="import-grid">
              <label className="upload-zone">
                <Upload size={34} />
                <strong>
                  {uploading ? "Importing..." : "Choose a CSV file"}
                </strong>
                <span>
                  One row per house result. Matching event and division rows are
                  updated.
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    importFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
              </label>
              <div className="export-zone">
                <Download size={34} />
                <strong>Download current results</strong>
                <span>
                  Get a CSV with all event scores for backup or editing.
                </span>
                <button className="button button-dark" onClick={exportCSV}>
                  Export CSV <ArrowDownRight size={16} />
                </button>
              </div>
            </div>
            <div className="csv-guide">
              <strong>Required CSV columns</strong>
              <code>
                event,category,division,time,status,house,athlete,place,points
              </code>
              <p>
                House must be Parakrama, Gemunu, Thissa, or Vijaya. Use
                “Completed” or “Upcoming” for status.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  const navigate = useNavigate();
  const {published,syncError,loading,refresh} = useScoreboard();
  const [entered,setEntered] = useState(false);
  const [draft,setDraft] = useState(loadData);
  const [unlocked,setUnlocked] = useState(() => sessionStorage.getItem("bcg-editor-unlocked") === "yes");
  const editorOpen = location.pathname === '/editor' && unlocked;
  const activeDraft = draft || {...published,baseRevision:published.revision};
  const data = editorOpen ? activeDraft : published;
  const {events,adjustments} = data;
  const standings=useMemo(()=>getStandings(events,adjustments),[events,adjustments]);
  function saveDraft(next) {
    localStorage.setItem(STORE_KEY,JSON.stringify(next));
    setDraft(next);
  }
  function updateDraft(updater) {
    setDraft(current=>{
      const next=updater(current || {...published,baseRevision:published.revision});
      localStorage.setItem(STORE_KEY,JSON.stringify(next));return next;
    });
  }
  const setEvents=updater=>updateDraft(current=>({...current,events:typeof updater==='function'?updater(current.events):updater}));
  const setAdjustments=updater=>updateDraft(current=>({...current,adjustments:typeof updater==='function'?updater(current.adjustments):updater}));
  function search(value) {
    const query=value.trim();
    if(query==='1234') {
      sessionStorage.setItem('bcg-editor-unlocked','yes');setUnlocked(true);navigate('/editor');
    } else if(query)navigate(`/events?q=${encodeURIComponent(query)}`);
  }
  function lock(){sessionStorage.removeItem('bcg-editor-unlocked');setUnlocked(false);navigate('/')}
  const publishing={
    draft:activeDraft,published,syncError,onRefresh:refresh,
    onPublished:document=>updateDraft(current=>({...current,baseRevision:document.revision})),
    onLoadPublished:async()=>{const latest=await refresh();if(latest)saveDraft({...latest,baseRevision:latest.revision})},
  };
  return <div className="app neon-theme" data-leading-house={standings[0].id} style={{'--accent':standings[0].neon}}>
    {!entered&&<LoadingScreen loading={loading} onComplete={()=>setEntered(true)}/>}
    <div className="meet-experience" inert={!entered}>
    <ArenaEffects/><MotionEffects/><Header onSearch={search} leader={standings[0]}/>
    {!editorOpen&&<div className="public-sync container"><span><i className={syncError?'sync-dot offline':'sync-dot'}/>{loading?'CONNECTING TO THE SCOREBOARD':syncError?'OFFLINE · LAST AVAILABLE SCORES':published.isSample?'PREVIEW SCOREBOARD':'SHARED SCOREBOARD'}</span><span>{published.publishedAt?`Updated ${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Colombo'}).format(new Date(published.publishedAt))} · Sri Lanka time`:'New scores appear here after publishing'}{syncError&&<button onClick={refresh}>Refresh</button>}</span></div>}
    <main><Routes>
      <Route path="/" element={<Home events={events} standings={standings} isSample={published.isSample}/>}/>
      <Route path="/standings" element={<Standings events={events} standings={standings} isSample={published.isSample}/>}/>
      <Route path="/events" element={<Events events={events}/>}/>
      <Route path="/results" element={<Results events={events} isSample={published.isSample}/>}/>
      <Route path="/editor" element={unlocked?<Editor events={events} setEvents={setEvents} adjustments={adjustments} setAdjustments={setAdjustments} onLock={lock} publishing={publishing}/>:<Navigate to="/" replace/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes></main><Footer/></div>
  </div>;
}
