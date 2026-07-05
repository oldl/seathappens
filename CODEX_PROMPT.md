# Prompt à coller dans Codex

Copie-colle tout ce qui suit dans Codex (ou tout agent de code type CLI) à la
racine de ce dossier `nextjs-app/`.

---

Tu es un ingénieur front-end senior. Construis **SeatHappens**, une app
d'enregistrement d'événement fun et colorée, à partir du scaffold Next.js déjà
présent dans ce dossier.

## Contexte

Ce dossier contient déjà :
- Un scaffold Next.js 14 (App Router) + Tailwind + Supabase configuré
  (`package.json`, `tailwind.config.ts`, `lib/supabaseClient.ts`).
- Le schéma SQL Supabase dans `supabase/schema.sql`.
- Une première implémentation de `app/page.tsx` (inscription), `app/wall/page.tsx`
  (mur des participants), et des composants (`StickerGrid`, `DrawCanvas`,
  `AvatarPreview`, `ParticipantCard`, `ShareButton`) dans `components/`.
- `lib/stickers.ts` génère les 12 avatars stickers en SVG inline (pas d'assets
  images à gérer).

**Ta mission : fiabiliser, terminer et polir cette implémentation** pour
qu'elle soit prête à déployer sur Vercel — pas repartir de zéro.

## Référence visuelle

Un prototype HTML interactif du produit existe dans le projet de design
(`SeatHappens.dc.html`) et reflète fidèlement le look final voulu : fond crème
pastel, doodles dessinés à la main (spirale, flèches, squiggles), logo
"SEATHAPPENS" dans un badge jaune penché, typo `Baloo 2` (titres/gras) +
`Poppins` (corps de texte), CTA noir plein "REJOINDRE LA SALLE →", stickers-avatars
ronds/étoile/cœur/éclair etc. avec un visage simple (deux yeux + sourire),
outil de dessin (canvas + palette de 6 couleurs + bouton Effacer), et un mur
de participants sur fond violet pastel avec compteur "X personnes dans la
place 🎉" et bouton "Partager le lien". Utilise ce fichier comme référence
pixel pour les couleurs, l'espacement, la typographie et les micro-interactions
(pas pour copier du code React — c'est un prototype HTML, pas la stack cible).

## Palette (à respecter, déjà dans `tailwind.config.ts`)
- Fond crème : `#FBF3E7`
- Encre / texte : `#1A1A1A`
- Accents : violet `#8A7CFB`, jaune `#FFD93D`, bleu `#3E6CF4`, rose `#FF6FA5`,
  vert `#3ECF8E`, orange `#FF7A45`
- Fond du mur : violet pastel `#C7BBFA`

## Ce qu'il faut vérifier / terminer

1. **Flow d'inscription** (`app/page.tsx`)
   - Pseudo obligatoire (non vide, trim), 24 caractères max.
   - Choix avatar : onglet "Choisir un sticker" (grille de 12) ou "Dessiner"
     (canvas libre, obligatoire d'avoir dessiné quelque chose avant de valider).
   - Bouton "REJOINDRE LA SALLE →" désactivé tant que le formulaire n'est pas
     valide (état visuel grisé vs noir plein).
   - Doublon de pseudo : géré côté DB (index unique case-insensitive) ET
     message d'erreur clair côté client (code Postgres `23505`).
   - À la soumission : insert Supabase puis redirection vers `/wall`.
   - Utilise l'UI optimiste déjà en place (sessionStorage) ou améliore-la :
     l'utilisateur ne doit jamais attendre un spinner bloquant.

2. **Mur des participants** (`app/wall/page.tsx`)
   - Fetch complet et frais à chaque visite (`dynamic = "force-dynamic"`).
   - Compteur dynamique "X personne(s) dans la place 🎉".
   - Bouton "Partager le lien" copie l'URL courante dans le presse-papier
     avec confirmation visuelle ("✅ Lien copié !").
   - Grille responsive de cartes (avatar + pseudo), `auto-fill minmax(135px,1fr)`.
   - Ajoute un état vide sympa (déjà ébauché) et un état de chargement
     (skeleton ou squelette animé simple) pendant le fetch.

3. **Qualité générale**
   - Mobile-first, entièrement responsive (teste à 360px de large).
   - Pas de login, aucune donnée sensible.
   - `npm run build` doit passer sans erreur TypeScript/ESLint.
   - Garde le code simple — c'est un MVP, pas une plateforme d'entreprise.

4. **Configuration Supabase**
   - Utilise `supabase/schema.sql` tel quel (table `participants`, RLS
     publique en lecture/écriture, index unique sur `lower(pseudo)`).
   - Documente dans le README toute étape supplémentaire si tu modifies le
     schéma.

## Livrables attendus
- Code Next.js fonctionnel, buildable, déployable sur Vercel avec les deux
  variables d'env `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Un résumé des changements apportés par rapport au scaffold de départ.
