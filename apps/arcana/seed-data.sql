-- ═══════════════════════════════════════════════════════════════════
-- ARCANA SEED DATA
-- Philosophical notes exploring consciousness and creativity
-- ═══════════════════════════════════════════════════════════════════

-- Clear existing data (optional - comment out if you want to preserve data)
DELETE FROM links;
DELETE FROM notes;

-- ─────────────────────────────────────────────────────────────────────
-- INSERT NOTES
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO notes (title, content, tags) VALUES
(
  'Consciousness',
  '# Consciousness

The hard problem of consciousness remains one of philosophy''s greatest mysteries. How does subjective experience arise from physical processes?

## The Mystery of Awareness

Consciousness is not merely information processing—it is the felt quality of experience, the "what it is like" to be something. This connects deeply to [[Qualia]], the subjective qualities of our experiences.

## Agency and Choice

Our conscious experience includes a sense of agency, the feeling that we make choices. This raises profound questions about [[Free Will]] and whether our decisions are truly our own.

## Philosophical Foundations

The study of consciousness sits at the heart of [[Philosophy of Mind]], drawing from neuroscience, psychology, and ancient contemplative traditions.',
  ARRAY['philosophy', 'mind']
),
(
  'Qualia',
  '# Qualia

Qualia are the subjective, qualitative properties of experiences—the redness of red, the painfulness of pain, the taste of wine.

## The Explanatory Gap

How do we bridge the gap between objective brain states and [[Subjective Experience]]? This question haunts philosophers and scientists alike.

## The Knowledge Argument

Mary the color scientist knows everything physical about color, yet learns something new when she first sees red. This thought experiment illuminates the irreducibility of qualia.

## Connection to Consciousness

Qualia are perhaps the most puzzling aspect of [[Consciousness]]—they resist reduction to purely physical explanations.',
  ARRAY['philosophy', 'perception']
),
(
  'Free Will',
  '# Free Will

Do we truly choose our actions, or are we sophisticated automatons following the laws of physics?

## The Illusion Debate

Some argue free will is an illusion—our sense of choice merely a post-hoc narrative constructed by [[Consciousness]]. Yet the experience of choosing feels undeniably real.

## Determinism and Choice

If the universe is deterministic, as [[Determinism]] suggests, can there be room for genuine agency? Compatibilists argue yes; libertarians about free will disagree.

## Moral Implications

Our entire system of moral responsibility rests on the assumption of free will. Without it, praise and blame lose their foundation.',
  ARRAY['philosophy', 'agency']
),
(
  'Creativity',
  '# Creativity

Creativity is the mysterious process by which novel ideas emerge from the depths of mind.

## The Creative Mind

What happens in [[Consciousness]] when we create? The answer involves both deliberate thought and unconscious incubation—a dance between control and surrender.

## Flow and Creation

The deepest creative work often occurs in [[Flow State]], where self-consciousness dissolves and creation happens through us rather than by us.

## Imagination as Foundation

All creativity begins with [[Imagination]]—the ability to envision what does not yet exist, to see possibilities beyond the actual.',
  ARRAY['creativity', 'mind']
),
(
  'Flow State',
  '# Flow State

Flow is the optimal state of consciousness where we perform at our peak, fully absorbed in the present moment.

## Characteristics of Flow

Time distorts, self-consciousness fades, and action merges with awareness. This state, studied extensively by Csikszentmihalyi, represents [[Consciousness]] at its most integrated.

## Accessing Flow

Flow requires a balance between challenge and skill. Too easy, and we grow bored; too hard, and anxiety blocks the state. [[Focus]] is the gateway.

## Flow and Creativity

In flow, [[Creativity]] flourishes. The inner critic quiets, allowing novel connections to emerge spontaneously.',
  ARRAY['psychology', 'creativity']
),
(
  'Philosophy of Mind',
  '# Philosophy of Mind

Philosophy of mind investigates the nature of mental phenomena and their relationship to the physical world.

## The Mind-Body Problem

How does mind relate to brain? This ancient question takes many forms: [[Consciousness]] and its neural correlates, [[Qualia]] and their physical basis.

## Dualism and Its Critics

[[Dualism]] proposes mind and body as distinct substances. While intuitive, this view faces serious challenges explaining their interaction.

## Contemporary Approaches

Modern philosophy of mind draws on cognitive science, neuroscience, and artificial intelligence to illuminate these ancient questions.',
  ARRAY['philosophy']
),
(
  'Subjective Experience',
  '# Subjective Experience

Subjective experience is the first-person perspective—the view from inside, the felt quality of being.

## The First-Person Perspective

No amount of third-person description captures what it''s like to taste chocolate or feel heartbreak. This is the domain of [[Qualia]].

## Privacy and Access

Our subjective experiences are private in a way nothing else is. Only I have direct access to my [[Consciousness]]; you can only infer it.

## The Hard Problem

Why is there subjective experience at all? Why aren''t we philosophical zombies, processing information without inner light?',
  ARRAY['philosophy', 'perception']
),
(
  'Determinism',
  '# Determinism

Determinism holds that every event, including human action, is the inevitable result of prior causes.

## Causal Chains

If we trace [[Causality]] backward, each event follows necessarily from what came before. The universe unfolds like a vast clockwork.

## Implications for Freedom

Determinism challenges [[Free Will]]. If our choices are determined by prior causes, in what sense are they truly ours?

## Quantum Uncertainty

Modern physics introduces genuine randomness at the quantum level. Does this rescue free will, or merely replace determinism with chance?',
  ARRAY['philosophy']
),
(
  'Imagination',
  '# Imagination

Imagination is the mind''s capacity to form images and ideas not present to the senses.

## The Theater of Mind

In imagination, [[Consciousness]] becomes a stage where we can rehearse possibilities, revisit memories, and construct fantasies.

## Foundation of Creativity

All [[Creativity]] begins in imagination. Before any invention exists in the world, it must first exist in someone''s mind.

## Imagination and Reality

The line between imagination and perception is thinner than we think. Both involve the brain constructing models of reality.',
  ARRAY['creativity', 'mind']
),
(
  'Dualism',
  '# Dualism

Dualism is the view that mind and body are fundamentally different kinds of substance.

## Cartesian Dualism

Descartes famously argued that mind (res cogitans) and body (res extensa) are distinct. The mind thinks; the body extends in space.

## The Interaction Problem

If mind and body are different substances, how do they interact? How does a non-physical thought cause a physical action?

## Modern Relevance

While few philosophers today accept substance dualism, the intuition behind it persists. [[Consciousness]] still seems irreducibly different from mere matter, as explored in [[Philosophy of Mind]].',
  ARRAY['philosophy']
),
(
  'Causality',
  '# Causality

Causality is the relationship between cause and effect—the glue that binds events together.

## Hume''s Challenge

Hume argued we never perceive causation directly; we only see constant conjunction. This challenges our confidence in causal knowledge.

## Causality and Determinism

[[Determinism]] rests on universal causation—every event has a cause. But quantum mechanics suggests some events may be genuinely uncaused.

## Free Will and Causes

The debate over [[Free Will]] often centers on causality. Are our choices caused by prior events, or can we be unmoved movers?',
  ARRAY['philosophy']
),
(
  'Focus',
  '# Focus

Focus is the directed attention that allows consciousness to illuminate specific aspects of experience.

## The Spotlight of Attention

[[Consciousness]] has limited bandwidth. Focus is how we allocate this precious resource, selecting what enters awareness.

## Focus and Flow

Sustained focus is the gateway to [[Flow State]]. When attention is fully absorbed, the magic of flow becomes possible.

## Distraction and Depth

In our age of constant distraction, the ability to focus deeply has become rare and valuable. Deep work requires protecting attention.',
  ARRAY['psychology']
);

-- ─────────────────────────────────────────────────────────────────────
-- INSERT LINKS (based on wikilinks in content)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO links (source_title, target_title) VALUES
-- Consciousness links
('Consciousness', 'Qualia'),
('Consciousness', 'Free Will'),
('Consciousness', 'Philosophy of Mind'),
-- Qualia links
('Qualia', 'Subjective Experience'),
('Qualia', 'Consciousness'),
-- Free Will links
('Free Will', 'Consciousness'),
('Free Will', 'Determinism'),
-- Creativity links
('Creativity', 'Consciousness'),
('Creativity', 'Flow State'),
('Creativity', 'Imagination'),
-- Flow State links
('Flow State', 'Consciousness'),
('Flow State', 'Focus'),
('Flow State', 'Creativity'),
-- Philosophy of Mind links
('Philosophy of Mind', 'Consciousness'),
('Philosophy of Mind', 'Qualia'),
('Philosophy of Mind', 'Dualism'),
-- Subjective Experience links
('Subjective Experience', 'Qualia'),
('Subjective Experience', 'Consciousness'),
-- Determinism links
('Determinism', 'Causality'),
('Determinism', 'Free Will'),
-- Imagination links
('Imagination', 'Consciousness'),
('Imagination', 'Creativity'),
-- Dualism links
('Dualism', 'Consciousness'),
('Dualism', 'Philosophy of Mind'),
-- Causality links
('Causality', 'Determinism'),
('Causality', 'Free Will'),
-- Focus links
('Focus', 'Consciousness'),
('Focus', 'Flow State');
