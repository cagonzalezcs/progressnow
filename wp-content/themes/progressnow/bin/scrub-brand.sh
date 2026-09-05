#!/usr/bin/env bash
#
# One-time content migration for an existing database:
#
#   1. theme rename data migration   rgvdsatheme / rgvdsa_* → progressnow / progressnow_*
#      (block names + ACF field keys inside post_content and postmeta, the
#      options-page slug, theme_mods, content-version option, active theme)
#   2. brand scrub                   regional phrases → chapter-neutral copy (EN + ES)
#   3. re-seed                       bin/seed.php (idempotent; ES pages are never clobbered)
#   4. audit                         prints any remaining regional token
#
# Every replacement goes through `wp search-replace`, which is serialization-
# safe, so ACF repeaters / Polylang MO blobs stay intact. Safe to re-run.
#
#   bin/scrub-brand.sh --yes [--path /site] [--wp "php /path/to/wp"] [--no-backup] [--dry-run]
#
set -euo pipefail

CONFIRM=0
DRY=0
BACKUP=1
SITE_PATH=""
WP="${WP:-wp}"

while [ $# -gt 0 ]; do
	case "$1" in
		--yes) CONFIRM=1 ;;
		--dry-run) DRY=1 ;;
		--no-backup) BACKUP=0 ;;
		--path) SITE_PATH="$2"; shift ;;
		--wp) WP="$2"; shift ;;
		-h|--help) sed -n '2,20p' "$0"; exit 0 ;;
		*) echo "unknown argument: $1" >&2; exit 1 ;;
	esac
	shift
done

if [ "$CONFIRM" -ne 1 ]; then
	echo "This rewrites database content. Re-run with --yes to confirm (add --dry-run to preview)." >&2
	exit 2
fi

THEME_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -z "$SITE_PATH" ]; then
	SITE_PATH="$(cd "$THEME_DIR/../../.." && pwd)"
fi

# shellcheck disable=SC2086
wp() { $WP --path="$SITE_PATH" "$@"; }

DRY_FLAG=""
if [ "$DRY" -eq 1 ]; then
	DRY_FLAG="--dry-run"
	echo "== DRY RUN — nothing is written =="
fi

# Precise, serialization-aware replace across the content tables.
replace() {
	wp search-replace "$1" "$2" wp_posts wp_postmeta wp_options wp_termmeta wp_terms \
		--precise --skip-columns=guid --report-changed-only $DRY_FLAG "${@:3}" || true
}

if [ "$BACKUP" -eq 1 ] && [ "$DRY" -eq 0 ]; then
	SNAPSHOT="${TMPDIR:-/tmp}/progressnow-pre-scrub-$(date +%Y%m%d-%H%M%S).sql"
	wp db export "$SNAPSHOT" --quiet
	echo "== snapshot: $SNAPSHOT"
fi

echo "== 1. theme rename data migration"
replace 'wp:rgvdsa/'                '"wp:progressnow/'
replace '<!-- wp:rgvdsa/'           '<!-- wp:progressnow/'
replace '"name":"rgvdsa/'           '"name":"progressnow/'
replace 'field_rgvdsa_'             'field_progressnow_'
replace 'group_rgvdsa_'             'group_progressnow_'
replace 'rgvdsa-chapter-settings'   'progressnow-chapter-settings'
replace 'rgvdsa-placeholder'        'progressnow-placeholder'
replace 'rgvdsa-default-share'      'progressnow-default-share'
replace 'rgvdsa-events'             'chapter-events'
replace 'progressnow-events'        'chapter-events'

if [ "$DRY" -eq 0 ]; then
	if wp option get theme_mods_rgvdsatheme --format=json >/dev/null 2>&1; then
		wp option get theme_mods_rgvdsatheme --format=json | wp option update theme_mods_progressnow --format=json
		wp option delete theme_mods_rgvdsatheme
		echo "moved theme_mods_rgvdsatheme → theme_mods_progressnow"
	fi
	if wp option get rgvdsa_content_ver >/dev/null 2>&1; then
		wp option update progressnow_content_ver "$(wp option get rgvdsa_content_ver)"
		wp option delete rgvdsa_content_ver
	fi
	if [ "$(wp option get stylesheet)" != "progressnow" ]; then
		wp theme activate progressnow
	fi
fi

echo "== 2. brand scrub (EN) — regional + organization phrases, longest first"
# Long sentences (copy that the seed also rewrites) before their fragments.
replace 'We’re the Rio Grande Valley chapter of the Democratic Socialists of America — the largest socialist organization in the United States — organizing working-class power across our border communities.' 'We’re a member-run organization building working-class power in our community.'
replace 'The Rio Grande Valley Democratic Socialists of America (DSA RGV) is a local chapter of the nation’s largest socialist organization. Based primarily in McAllen, Texas, our grassroots group focuses on progressive labor organizing, mutual aid, and socialist political education throughout South Texas.' 'We are a member-run, member-funded organizing group. Our grassroots work focuses on labor organizing, mutual aid, and political education across our community.'
replace 'Everything we do is member-led, member-funded, and open to anyone who wants to build a Valley that works for working people. We regularly host community meetings — often in McAllen — to share updates, plan campaigns, and hold political education lectures. You can find our organizing platforms on the DSA Rio Grande Valley Action Network, and if you’re a student, we operate a collegiate branch: the UTRGV Young Democratic Socialists of America.' 'Everything we do is member-led, member-funded, and open to anyone who wants to build a community that works for working people. We regularly host community meetings to share updates, plan campaigns, and hold political education lectures. If you’re a student, ask us about our campus branch.'
replace 'The Democratic Socialists of America is founded, growing into the largest socialist organization in the United States.' 'Progress Now is founded as a member-run organizing project.'
replace 'Valley organizers form an organizing committee and begin meeting in McAllen.' 'Local organizers form an organizing committee and begin meeting.'
replace 'DSA RGV is chartered as an official local chapter, organizing across four counties in South Texas.' 'The chapter is chartered as an official local chapter.'
replace 'Democratic socialists believe that our economy' 'We believe our economy'
replace 'As democratic socialists, we’re building' 'Together, we’re building'
replace 'what democratic socialism means, what our chapter is working on' 'what we stand for, what our chapter is working on'
replace 'Sign up through national DSA and select the Rio Grande Valley chapter. Dues are sliding-scale' 'Sign up in a few minutes. Dues are sliding-scale'
replace 'Dues are sliding-scale through national DSA' 'Dues are sliding-scale'
replace 'How do I switch to a monthly or Solidarity Dues rate?' 'How do I change my dues rate?'
replace 'in the national dues form' 'in the dues form'
replace 'Already a member but switching to a monthly or Solidarity Dues rate? Enter the email associated with your membership in this form' 'Already a member and changing your dues rate? Enter the email associated with your membership in the dues form'
replace 'Night School: What Is Democratic Socialism?' 'Night School: Organizing 101'
replace 'Night School: Socialism & the Border' 'Night School: Immigration & Labor'
replace 'Rio Grande Valley Democratic Socialists of America' 'Progress Now'
replace 'Rio Grande Valley DSA' 'Progress Now'
replace 'Democratic Socialists of America' 'Progress Now'
replace 'DSA Rio Grande Valley Action Network' 'our Action Network'
replace 'Students: UTRGV YDSA' 'Students'
replace 'UTRGV YDSA' 'our student branch'
replace 'Become a DSA member' 'Become a member'
replace 'Join at dsausa.org →' 'Join now →'
replace 'https://act.dsausa.org/donate/membership' '/get-involved/#join'
replace 'RGV-DSA 101' 'Progress Now 101'
replace 'DSARGV 101' 'Progress Now 101'
replace 'DSA 101' 'Progress Now 101'
replace 'Join DSA' 'Join us'
replace 'A better RGV is possible' 'A better world is possible'
replace 'A better Rio Grande Valley is possible!' 'A better world is possible!'
replace 'RGV DSA members gathered at a chapter action' 'Chapter members gathered at a community action'
replace 'the Rio Grande Valley we deserve' 'the future our community deserves'
replace 'a Rio Grande Valley where' 'a future where'
replace 'In the Rio Grande Valley,' 'In our community,'
replace 'Rio Grande Valley' 'our community'
replace 'Counties We Serve' 'Where We Organize'
replace 'across the Valley' 'across our community'
replace 'in the Valley' 'in our community'
replace 'the Valley' 'our community'
replace 'a Valley that' 'a community that'
replace 'a better Valley' 'a better world'
replace 'We are <span class="notranslate">DSARGV</span>' 'We are <span class="notranslate">Progress Now</span>'
replace 'RGV DSA' 'Progress Now'
replace 'DSA RGV' 'Progress Now'
replace 'DSARGV' 'Progress Now'
replace 'RGV-DSA' 'Progress Now'
replace 'https://www.instagram.com/dsa_rgv/' ''
replace 'https://instagram.com/dsa_rgv' ''
replace 'https://facebook.com/dsargv' ''
replace 'https://twitter.com/dsa_rgv' ''
replace 'https://actionnetwork.org/forms/dsa-rgv-newsletter-sign-up' ''
replace 'Instagram — <span class="notranslate">@dsa_rgv</span>' 'Instagram'
replace '@dsa_rgv' ''
replace 'McAllen · Edinburg · Mission · Pharr' 'Downtown · Midtown'
replace 'Brownsville · Harlingen · San Benito' 'Northside · Uptown'
replace 'Raymondville · Lyford' 'Southside · Riverside'
replace 'Rio Grande City · Roma' 'Student branch'
replace 'Hidalgo' 'Central'
replace 'Willacy' 'South'
replace 'One chapter, four counties.' 'One chapter, many communities.'
replace 'in your county' 'in your neighborhood'
replace 'McAllen Public Library' 'Central Library'
replace 'McAllen' 'Downtown'

echo "== 2b. brand scrub (ES — translations stay Spanish)"
replace 'Somos el capítulo del Valle del Río Grande de los Socialistas Democráticos de América —la organización socialista más grande de los Estados Unidos— organizando el poder de la clase trabajadora en nuestras comunidades fronterizas.' 'Somos una organización dirigida por sus miembros que construye el poder de la clase trabajadora en nuestra comunidad.'
replace 'Los Socialistas Democráticos de América del Valle del Río Grande (DSA RGV) somos un capítulo local de la organización socialista más grande del país. Con base principalmente en McAllen, Texas, nuestro grupo de base se enfoca en la organización laboral progresista, la ayuda mutua y la educación política socialista en todo el sur de Texas.' 'Somos un grupo organizador dirigido y financiado por sus miembros. Nuestro trabajo de base se enfoca en la organización laboral, la ayuda mutua y la educación política en toda nuestra comunidad.'
replace 'Todo lo que hacemos es dirigido por los miembros, financiado por los miembros y abierto a cualquiera que quiera construir un Valle que funcione para la gente trabajadora. Organizamos reuniones comunitarias con regularidad —a menudo en McAllen— para compartir novedades, planear campañas y ofrecer charlas de educación política. Puedes encontrar nuestras plataformas de organización en la Action Network de DSA Rio Grande Valley, y si eres estudiante, tenemos una rama universitaria: los Jóvenes Socialistas Democráticos de América de UTRGV.' 'Todo lo que hacemos es dirigido por los miembros, financiado por los miembros y abierto a cualquiera que quiera construir una comunidad que funcione para la gente trabajadora. Organizamos reuniones comunitarias con regularidad para compartir novedades, planear campañas y ofrecer charlas de educación política. Si eres estudiante, pregúntanos por nuestra rama universitaria.'
replace 'Se fundan los Socialistas Democráticos de América, que llegan a ser la organización socialista más grande de los Estados Unidos.' 'Se funda Progress Now como un proyecto organizador dirigido por sus miembros.'
replace 'Organizadores del Valle forman un comité organizador y comienzan a reunirse en McAllen.' 'Organizadores locales forman un comité organizador y comienzan a reunirse.'
replace 'DSA RGV se constituye como capítulo local oficial, organizando en cuatro condados del sur de Texas.' 'El capítulo se constituye como capítulo local oficial.'
replace 'Los socialistas democráticos creemos que' 'Creemos que'
replace 'Como socialistas democráticos, construimos' 'Juntos, construimos'
replace 'qué significa el socialismo democrático, en qué trabaja nuestro capítulo' 'qué defendemos, en qué trabaja nuestro capítulo'
replace 'Regístrate a través del DSA nacional y selecciona el capítulo del Valle del Río Grande. Las cuotas son de escala móvil' 'Regístrate en unos minutos. Las cuotas son de escala móvil'
replace 'Las cuotas son de escala móvil a través del DSA nacional' 'Las cuotas son de escala móvil'
replace '¿Cómo cambio a una cuota mensual o de Solidaridad?' '¿Cómo cambio mi cuota?'
replace 'en el formulario nacional de cuotas' 'en el formulario de cuotas'
replace '¿Ya eres miembro pero quieres cambiar a una cuota mensual o de Solidaridad? Ingresa el correo asociado a tu membresía en este formulario' '¿Ya eres miembro y quieres cambiar tu cuota? Ingresa el correo asociado a tu membresía en el formulario de cuotas'
replace 'Un capítulo dirigido por sus miembros de los Socialistas Democráticos de América, organizando por la gente trabajadora en todo el Valle del Río Grande.' 'Un capítulo dirigido por sus miembros, organizando por la gente trabajadora en toda nuestra comunidad.'
replace 'Socialistas Democráticos de América' 'Progress Now'
replace 'el Valle del Río Grande que merecemos' 'el futuro que nuestra comunidad merece'
replace 'un Valle del Río Grande donde' 'un futuro donde'
replace 'En el Valle del Río Grande' 'En nuestra comunidad'
replace 'Valle del Río Grande' 'nuestra comunidad'
replace '¡Un mejor Valle del Río Grande es posible!' '¡Un mundo mejor es posible!'
replace 'Un mejor RGV es posible' 'Un mundo mejor es posible'
replace 'Miembros de RGV DSA reunidos en una acción del capítulo' 'Miembros del capítulo reunidos en una acción comunitaria'
replace 'Condados que servimos' 'Dónde organizamos'
replace 'Un capítulo, cuatro condados.' 'Un capítulo, muchas comunidades.'
replace 'en tu condado' 'en tu vecindario'
replace 'por todo el Valle' 'por toda nuestra comunidad'
replace 'en todo el Valle' 'en toda nuestra comunidad'
replace 'cada persona del Valle' 'cada persona de nuestra comunidad'
replace 'el futuro del Valle' 'nuestro futuro'
replace 'un Valle mejor' 'un mundo mejor'
replace 'Somos <span class="notranslate">DSARGV</span>' 'Somos <span class="notranslate">Progress Now</span>'
replace 'Estudiantes: UTRGV YDSA' 'Estudiantes'
replace 'Hazte miembro del DSA' 'Hazte miembro'
replace 'Únete en dsausa.org →' 'Únete ahora →'
replace 'Ven a RGV-DSA 101' 'Ven a Progress Now 101'
replace 'RGV-DSA 101' 'Progress Now 101'
replace 'DSARGV 101' 'Progress Now 101'
replace 'Únete al DSA' 'Únete'
replace 'Acerca de RGV DSA' 'Sobre el capítulo'
replace 'Escuela nocturna: el socialismo y la frontera' 'Escuela nocturna: migración y trabajo'

if [ "$DRY" -eq 0 ]; then
	for opt in blogname blogdescription; do
		value="$(wp option get "$opt")"
		case "$value" in
			*"Rio Grande"*|*RGV*|*"Valley"*)
				if [ "$opt" = "blogname" ]; then wp option update "$opt" "Progress Now"; else wp option update "$opt" "Organizing our community."; fi
				echo "updated $opt (was: $value)"
				;;
		esac
	done

	echo "== 3. re-seed (idempotent)"
	wp eval-file "$THEME_DIR/bin/seed.php"
	wp rewrite flush --hard >/dev/null 2>&1 || wp rewrite flush
fi

echo "== 4. audit — remaining regional tokens"
PATTERN='Rio Grande|R[ií]o Grande|[[:<:]]RGV[[:>:]]|rgvdsa|dsargv|dsa_rgv|dsa-rgv|Willacy|McAllen|Brownsville|Harlingen|Edinburg|Weslaco|UTRGV|\(956\)|[[:<:]]DSA[[:>:]]|Democratic Socialis|ocialis[mt]|dsausa|YDSA'
wp db query "SELECT 'posts' AS tbl, ID AS id, post_title AS label FROM wp_posts WHERE post_status <> 'trash' AND (post_title REGEXP '$PATTERN' OR post_content REGEXP '$PATTERN' OR post_excerpt REGEXP '$PATTERN')
UNION ALL SELECT 'postmeta', meta_id, CONCAT(post_id, ':', meta_key) FROM wp_postmeta WHERE meta_value REGEXP '$PATTERN'
UNION ALL SELECT 'options', option_id, option_name FROM wp_options WHERE option_value REGEXP '$PATTERN'
UNION ALL SELECT 'termmeta', meta_id, CONCAT(term_id, ':', meta_key) FROM wp_termmeta WHERE meta_value REGEXP '$PATTERN'
UNION ALL SELECT 'terms', term_id, name FROM wp_terms WHERE name REGEXP '$PATTERN'" || true
echo "(an empty result above means the database is clean; 'Cameron'/'Starr' are not audited — they are common names — review the Where-We-Organize cards by hand)"
