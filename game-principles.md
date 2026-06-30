# Game Principles — kids-games

> How we design games for **kids aged 5–10**, and *why*. This is the "north star"
> document: the product reasoning behind the engineering conventions in
> [`CLAUDE.md`](./CLAUDE.md). When a design decision is unclear, decide it here
> first, then implement.

These principles are drawn from **developmental child psychology** and
**behaviour-analytic** practice — how children of this age actually attend,
learn, and stay motivated — not from our own preferences. Where we mention how an
athlete or a Formula 1 driver prepares to focus, it is only an **analogy** to make
a principle memorable; the principle itself comes from the literature on children.

---

## 0. Mission

Open-access (no login) browser games that help kids **practise and measure four
kinds of cognitive skill** — and give parents a gentle, honest picture of their
child's abilities over time:

- **Aptitude** — general problem-solving / reasoning readiness.
- **Memory** — recognition, working, and sequential memory.
- **Analytic** — planning, logic, pattern / odd-one-out, sorting.
- **Typing** — letter recognition and keyboard fluency.

We claim a game **trains or measures the named skill** — not broad "IQ transfer".
Honesty about what a task does is itself a principle (see §9).

---

## 1. Know the 5–10 year old (developmental frame)

Design must fit where the child actually is, not where an adult is. Across ages
5–10 children are moving (in Piagetian terms) from **pre-operational** toward
**concrete-operational** thinking: they reason about concrete, visible things far
better than abstract rules or text.

Practical consequences:

- **Show, don't tell.** Meaning rides on **emoji + colour + voice + motion**, not
  on sentences. Words are decoration; the picture and the sound are the carrier.
- **One idea on screen at a time.** Young children have a small **working-memory
  span** (roughly 2–4 items at age 5, growing toward 5–7 by age 10). Never make a
  child hold more in their head than their age allows — that is the *difficulty
  knob*, not an accident.
- **Concrete goals.** "Find the two that match" beats "improve your memory."
- **Egocentric → social.** Younger kids play for the activity itself; a friendly
  character (Buddy) who *notices and reacts to them* is more motivating than an
  abstract score.

---

## 2. Attention & focus

Attention is the scarcest resource at this age and the thing parents most want to
grow. We treat it as something we **protect and gently stretch**, never overload.

- **Match session length to age.** A common rule of thumb from child-development
  practice is roughly **2–5 minutes of sustained focus per year of age**. A round
  should be *completable* well within that window; we end on a high note rather
  than letting attention collapse.
- **Stretch, then rest.** Like interval training, attention grows by working *just
  past* comfort and then recovering — not by marathon sessions. Design rounds that
  ramp difficulty, then offer a clear, celebrated stopping point.
- **Protect the "focus state" (flow).** A child is absorbed when challenge slightly
  exceeds skill. Too easy → boredom; too hard → anxiety. Our difficulty curve
  exists to keep each child in that narrow band (see §6).
- **Remove attention thieves.** No surprise pop-ups, no flashing ad-style motion,
  no timers that induce panic in a learning context, no competing sounds. The only
  things that move are things that *mean* something.
- **Single-tasking.** Present one task channel at a time. We do not split the
  child's attention between two simultaneous demands.

> *Analogy:* an F1 driver doesn't try to focus harder for longer by willpower —
> they engineer the conditions (routine, rest, removing distractions) so focus
> comes naturally. We engineer the *screen* the same way for the child.

---

## 3. Motor skills & input

Fine-motor control is still developing; pointer precision at 5 is far below an
adult's. The interface must forgive imprecision and *build* control.

- **Big targets, generous spacing.** Small fingers mistap. Hit targets are large
  and well separated; we'd rather have fewer, bigger tiles than many small ones.
- **Both input modes, always.** Every game must work with **touch** (iPad/phone,
  portrait and landscape) **and** with a **keyboard** (laptop, or a TV/monitor + a
  keyboard for a child practising typing). Never assume one input.
- **No hover-only interactions.** Touch has no hover. Anything important must work
  on tap/click and on keydown.
- **Immediate, physical feedback.** Every tap anywhere gets a visible ripple, and
  every control springs under the press. This closes the **action → consequence**
  loop instantly, which is how motor skills are reinforced.
- **Forgive, don't punish, mistakes.** A mis-tap is a motor event, not a failure.
  We never penalise the *act* of touching.

---

## 4. Feedback & motivation (behaviour-analytic core)

This is where behaviour analysis is most directly applied. Behaviour that is
**reinforced** recurs; behaviour that is punished is *suppressed and associated
with the context* — which for us means "associated with the game / with learning".
So:

- **Reinforce every correct action, immediately.** A quick spoken "Yay!", a visual
  cheer, a sound. Reinforcement must be **immediate** (within ~1 second) and
  **contingent** on the right behaviour to actually shape it.
- **Be gentle on wrong answers — never punish.** "Try again, good luck!" — encourage,
  re-cue, and let them retry. No harsh red flashes, no buzzers, no score loss, no
  scolding voice. A wrong answer is information, not a verdict.
- **Errorless-learning lean.** When a child struggles, *reduce the difficulty or
  give a hint* (Buddy's "Help me!") rather than letting them fail repeatedly.
  Repeated failure teaches avoidance; near-guaranteed success teaches engagement.
- **Favour intrinsic over extrinsic.** Stars, levels and stickers exist to *mark
  progress and mastery*, not to bribe. The deepest motivation is the satisfying
  feel of the task itself (§3 feedback) and visible competence growing.
- **Celebrate mastery, not just activity.** Winning a round, levelling up, and
  "you got faster than last time" are worth a real celebration.
- **Variety keeps reinforcement potent.** Rotate content (different emoji, prompts,
  praise lines) so praise and novelty don't satiate.

**Buddy** (the astronaut mascot) is the social-reinforcement agent: it watches,
cheers, encourages on a miss, and offers help. A warm, *consistent* responder is
itself a motivator for this age.

---

## 5. Measuring ability honestly

Parents come for insight, so measurement must be fair and meaningful — not a vanity
score.

- **Measure the named skill, cleanly.** Each game targets one skill; metrics
  (accuracy, speed, retries, span reached) reflect *that* skill.
- **Adapt to the child, then report on a stable scale.** Difficulty adapts so the
  child stays in flow (§6), but the dashboard reports trends the parent can read:
  focus time, win rate, average speed, retries, per-game and last-7-days.
- **Show growth, not ranking.** We compare a child to **their own past**, never to
  other children. Norm-style judgement is out of scope and out of spirit.
- **Be transparent about limits.** A game measures performance on *that task on
  that day* (sleep, mood, and time of day all matter — see §7). We present trends,
  not diagnoses.

---

## 6. Difficulty & session design

The difficulty curve is the main instrument for keeping each child in flow (§2).

- **Start below the child's level** to guarantee an early win and build momentum.
- **Ramp in small steps**, one variable at a time (more items, faster pace, less
  contrast) — matched to the working-memory ceiling for the age (§1).
- **Adapt down quickly** on repeated misses; adapt up gently on a streak.
- **End on success.** Conclude a round at a high point so the *last* memory of the
  session is a win — this strongly shapes whether the child wants to return.
- **Keep rounds short** (§2) and make the stopping point obvious and celebrated, so
  we never train the child to play to exhaustion.

---

## 7. The whole child: sleep, time of day, state

Cognitive performance is not just "in the game". Behaviour and developmental
science are clear that **sleep, rest, and arousal state** gate attention and
memory in children even more than in adults.

- **We are a practice tool, not a replacement for rest.** Short, well-paced
  sessions; clear endings; no mechanics that pull a tired child to keep going.
- **No engagement traps.** No streak-anxiety, no daily-login coercion, no
  infinite-scroll loop, no "one more" dark patterns. These exploit developing
  self-regulation and are explicitly banned (§9).
- **Surface state honestly to parents.** Because performance varies with sleep and
  time of day, the dashboard frames results as *trends across sessions*, and we
  encourage play when the child is rested and willing.

> *Analogy again:* an athlete's race-day focus is built mostly the night before —
> by sleep and routine. A child's attention works the same way. The best thing our
> game can do is be **calm, short, and well-timed**, and stay out of the way of
> rest.

---

## 8. Accessibility & inclusion

Every child should be able to play, and every family should be able to tune the
experience. All settings persist locally.

- **Sound on/off** (some settings/rooms need silence; some kids need audio).
- **Reduced motion** for motion-sensitive children — disables the press animation
  and tap ripple, calms in-game effects.
- **High-contrast palette** and **light / dark / system theme**.
- **Buddy side** (left / right / off) so the mascot suits the child and the device.
- **Generous spacing & big targets** everywhere (§3) — an accessibility default,
  not an option.
- **Voice** (Web Speech) so pre-readers are never blocked by text.

---

## 9. Anti-patterns — what we will NOT do

Stated plainly so they're easy to enforce in review:

- ❌ **Punishment** for wrong answers (harsh colour/sound, losing points, scolding).
- ❌ **Dark patterns**: streak guilt, login bribes, fake urgency, "one more" loops,
  variable-ratio reward schedules tuned to maximise time-on-device.
- ❌ **Reading walls** — paragraphs a 5-year-old must parse to proceed.
- ❌ **Tiny / crowded targets**, hover-only controls, single-input designs.
- ❌ **Comparison/ranking** of one child against others.
- ❌ **Overclaiming** — promising IQ gains or "transfer" we can't substantiate.
- ❌ **Attention thieves** — motion or sound that doesn't carry meaning.

---

## 10. How principles map to the codebase

| Principle | Where it lives |
|---|---|
| Show-don't-tell, emoji/voice | `@kids/game-engine` glyph rendering + Web Speech (`speakYay` etc.) |
| Immediate reinforcement | `useFeedback()` (`cheer`/`retry`), `playSuccess`/`playError`/`playWin` |
| Social reinforcer (Buddy) | `BuddyPanel`, `GameLayout`, `idleMessage`, `onHelp` hints |
| Big targets / both inputs | `GameBoard` `gridCells` gaps; canvas taps + `window` `keydown` |
| Physical tap feedback | `TapRipple` (whole-screen ripple) + global `:active` press in `index.css` |
| Reduced motion / a11y | settings schema + `.reduce-motion` on `<html>` (gates ripple & press) |
| Difficulty / flow | `gamification/levels.ts` curves; `scoring.ts` metrics |
| Honest measurement | `SessionRecord` (`recordRound`) → `computeStats` → `/parent` dashboard |
| End-on-success, short rounds | per-game round logic + `ResultDialog` |

When you add a game, re-read this file and §"Adding a new game" in
[`CLAUDE.md`](./CLAUDE.md). If a feature can't be justified against these
principles, it doesn't ship.
