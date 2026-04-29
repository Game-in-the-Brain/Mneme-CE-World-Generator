import type { WealthLevel, PowerStructure, DevelopmentLevel, PowerSource } from '../types';

// =====================
// Culture Table (D66 × D6)
// =====================

const CULTURE_TRAITS: string[][] = [
  ['Anarchist', 'Bureaucratic', 'Caste system', 'Collectivist', 'Competitive', 'Cosmopolitan'],
  ['Deceptive', 'Degenerate', 'Devoted', 'Egalitarian', 'Elitist', 'Fatalistic'],
  ['Fearful', 'Generous', 'Gregarious', 'Heroic', 'Honest', 'Honorable'],
  ['Hospitable', 'Hostile', 'Idealistic', 'Indifferent', 'Individualist', 'Intolerant'],
  ['Isolationist', 'Legalistic', 'Libertarian', 'Militarist', 'Pacifist', 'Paranoid'],
  ['Piety', 'Progressive', 'Proud', 'Rustic', 'Ruthless', 'Scheming'],
];

export const CULTURE_OPPOSITES: Record<string, string[]> = {
  'Anarchist':     ['Bureaucratic', 'Legalistic'],
  'Bureaucratic':  ['Anarchist', 'Libertarian'],
  'Caste system':  ['Egalitarian'],
  'Collectivist':  ['Individualist'],
  'Cosmopolitan':  ['Isolationist', 'Rustic'],
  'Deceptive':     ['Honest', 'Honorable'],
  'Degenerate':    ['Honorable', 'Proud'],
  'Devoted':       ['Indifferent'],
  'Egalitarian':   ['Elitist', 'Caste system'],
  'Elitist':       ['Egalitarian'],
  'Fatalistic':    ['Idealistic'],
  'Fearful':       ['Heroic'],
  'Generous':      ['Ruthless'],
  'Gregarious':    ['Paranoid'],
  'Heroic':        ['Fearful'],
  'Honest':        ['Deceptive', 'Scheming'],
  'Honorable':     ['Ruthless', 'Deceptive', 'Degenerate'],
  'Hospitable':    ['Hostile'],
  'Hostile':       ['Hospitable', 'Pacifist'],
  'Idealistic':    ['Fatalistic'],
  'Indifferent':   ['Devoted'],
  'Individualist': ['Collectivist'],
  'Isolationist':  ['Cosmopolitan'],
  'Legalistic':    ['Libertarian', 'Anarchist'],
  'Libertarian':   ['Legalistic', 'Bureaucratic'],
  'Militarist':    ['Pacifist'],
  'Pacifist':      ['Militarist', 'Hostile'],
  'Paranoid':      ['Gregarious'],
  'Progressive':   ['Rustic'],
  'Proud':         ['Degenerate'],
  'Rustic':        ['Cosmopolitan', 'Progressive'],
  'Ruthless':      ['Honorable', 'Generous'],
  'Scheming':      ['Honest'],
};

export const POWER_CULTURE_CONFLICTS: Record<PowerSource, string[]> = {
  'Kratocracy':  ['Pacifist', 'Egalitarian', 'Legalistic'],
  'Democracy':   ['Anarchist'],
  'Aristocracy': ['Egalitarian'],
  'Meritocracy': ['Caste system'],
  'Ideocracy':   ['Anarchist', 'Libertarian'],
};

export function generateCultureTraits(count: number = 1, exclude: string[] = []): string[] {
  const traits: string[] = [];

  for (let i = 0; i < count; i++) {
    let trait: string | undefined;
    let attempts = 0;
    while (attempts < 20) {
      const roll1 = Math.floor(Math.random() * 6);
      const roll2 = Math.floor(Math.random() * 6);
      const roll3 = Math.floor(Math.random() * 6);
      const row = roll1 + roll2; // 0-10, clamp to 0-5
      const col = roll3;
      const candidate = CULTURE_TRAITS[Math.min(5, row)]?.[col];
      const opposesExisting = candidate ? traits.some(t =>
        CULTURE_OPPOSITES[t]?.includes(candidate) ||
        CULTURE_OPPOSITES[candidate]?.includes(t)
      ) : false;
      if (candidate && !traits.includes(candidate) && !exclude.includes(candidate) && !opposesExisting) {
        trait = candidate;
        break;
      }
      attempts++;
    }
    if (trait) traits.push(trait);
  }

  return traits;
}

export const CULTURE_TRAIT_DESCRIPTIONS: Record<string, string> = {
  'Anarchist':    'Society operates without centralised authority. Power is distributed among local communities or strong individuals. Disputes are settled by consensus, reputation, or force — formal government is absent or minimal.',
  'Bureaucratic': 'Governed by elaborate formal procedures and hierarchies of officials. Progress is slow and paper-heavy. Outsiders find the system impenetrable without local contacts or expert knowledge.',
  'Caste system': 'Social class is fixed at birth and rarely changes. Occupation, marriage, and rights are tied to caste membership. Intermingling between castes is discouraged or forbidden.',
  'Collectivist': 'The group takes precedence over the individual. Resources and achievements are shared communally. Individual ambition is viewed with suspicion; loyalty to the collective is the highest virtue.',
  'Competitive':  'Driven by rivalry — economic, political, or social. Factions constantly vie for status and resources. Innovation is high but cooperation is low; betrayal is common in business and politics.',
  'Cosmopolitan': 'Open, diverse, and outward-looking. Outsiders are welcomed; multiple languages and customs coexist. Trade and cultural exchange are celebrated; insularity is considered backward.',
  'Deceptive':    'Dissembling is culturally accepted or even admired. Contracts are honoured only when convenient. Visitors should assume they are being misled; direct dealing is considered naïve.',
  'Degenerate':   'Social structures are in visible decay. Corruption, excess, and breakdown of shared norms are widespread. The ruling class indulges itself while the population suffers.',
  'Devoted':      'Organised around a powerful faith, ideology, or cause. Members sacrifice personal interests readily. Outsiders who do not share the devotion may be viewed as threats or potential converts.',
  'Egalitarian':  'Social equality is a core value. Titles, inherited wealth, and privilege are viewed with suspicion. Everyone is expected to contribute and receive fair reward.',
  'Elitist':      'Stratified by talent, birth, or achievement — and those at the top are unapologetic about it. Access to power is tightly controlled by a privileged few.',
  'Fatalistic':   'Outcomes are believed to be predetermined — by fate, the stars, or divine will. There is little sense of personal agency. Tragedy is accepted with resignation; risk is taken boldly.',
  'Fearful':      'Chronic fear shapes daily life — of authority, outsiders, or each other. Informants are common. Public behaviour is guarded. Creativity and dissent are suppressed by the constant threat of consequences.',
  'Generous':     'Hospitality and giving are core values. Wealth is measured by how much is given away. Visitors can expect food, shelter, and help; refusing a gift is a serious insult.',
  'Gregarious':   'Outgoing and social. Business is conducted over meals and celebrations. Silence and reserve are read as hostility. Networking is essential to getting anything done.',
  'Heroic':       'Celebrates bold action, personal courage, and decisive leadership. Self-sacrifice for a worthy cause is the highest honour. Caution and compromise are viewed as cowardice.',
  'Honest':       'Directness and truthfulness are paramount virtues. Lying — even polite social lies — is deeply shameful. Negotiations are blunt; what you see is what you get.',
  'Honorable':    'A strict code of personal conduct governs all interactions. Promises made are kept regardless of cost. Insults demand satisfaction. Reputation is everything.',
  'Hospitable':   'Welcoming strangers is a near-sacred duty. Travellers receive food, shelter, and protection as guests. In return, guests must behave with respect; violating hospitality is unforgivable.',
  'Hostile':      'Outsiders are viewed with deep suspicion or open aggression. Trade and diplomacy are grudging. Violence is a common first response to perceived threats.',
  'Idealistic':   'Driven by a vision of a better future — political, spiritual, or philosophical. Pragmatism is subordinated to principle. Grand projects are launched with enthusiasm; results rarely match the vision.',
  'Indifferent':  'Largely apathetic to politics, religion, and outside events. People focus on day-to-day comfort. The society is stable but difficult to mobilise for collective action, good or ill.',
  'Individualist':'Personal freedom and self-determination are paramount. Community obligations are minimal; everyone makes their own way. Privacy is jealously guarded; mutual aid is transactional.',
  'Intolerant':   'Conformity is enforced in belief, appearance, or behaviour. Minorities or those who deviate from norms face discrimination. The dominant group defines what is acceptable.',
  'Isolationist': 'Prefers minimal contact with outsiders. Off-world trade and immigration are restricted. Self-sufficiency is a point of pride. Outsiders are rarely made welcome.',
  'Legalistic':   'Governed by an intricate body of law applied rigorously. Contracts are everything. Legal disputes are common and consume years. An advocate is essential for any significant dealings.',
  'Libertarian':  'Personal freedom is the supreme value. Government is minimal by design; taxation and regulation are resisted. The individual is sovereign. The resulting society is dynamic, unequal, and occasionally chaotic.',
  'Militarist':   'Military virtues — discipline, strength, sacrifice — dominate culture. A significant fraction of the population serves or has served. Foreign policy is assertive; war is always a near possibility.',
  'Pacifist':     'Violence is culturally abhorrent. Conflict is resolved through mediation or passive resistance. Military forces are minimal. The society may be vulnerable but its internal cohesion is usually high.',
  'Paranoid':     'Lives in fear of hidden enemies — foreign agents, conspirators, or unseen forces. Surveillance is normalised. Strangers are automatically suspect. Accusations of betrayal are common and dangerous.',
  'Piety':        'Religious observance permeates every aspect of daily life. Festivals, prayers, and ritual duties structure the calendar. Offending religious sensibilities — even unknowingly — has serious consequences.',
  'Progressive':  'Embraces change, experimentation, and modernisation. Traditional structures are questioned or dismantled. Innovation is celebrated; rapid social change creates opportunity and instability in equal measure.',
  'Proud':        'Has a strong sense of its own greatness — historical, cultural, or racial. Perceived slights against national honour are taken very seriously. Admitting weakness is almost impossible.',
  'Rustic':       'Values simplicity, self-reliance, and closeness to the land. Urban sophistication is viewed with suspicion. Hard work, practical skills, and community ties are the true measures of a person.',
  'Ruthless':     'Winning is everything. Compassion and sentiment are luxuries. Competitors are destroyed, not merely defeated. Visitors are advised not to show weakness.',
  'Scheming':     'Political and social life is a labyrinth of alliances, betrayals, and counter-moves. Everyone has an agenda; nothing is said directly. Information is currency. Naïveté is fatal.',
};

/** R3 / QA-073: Low-population terminology variants for populations < 1,000,000 */
export const CULTURE_TRAIT_DESCRIPTIONS_LOW_POP: Record<string, string> = {
  'Anarchist':    'The community operates without centralised authority. Power is distributed among local families or strong individuals. Disputes are settled by consensus, reputation, or force — formal leadership is absent or minimal.',
  'Bureaucratic': 'Governed by elaborate formal procedures and hierarchies. Progress is slow and record-heavy. Outsiders find the system impenetrable without local contacts or expert knowledge.',
  'Caste system': 'Social class is fixed at birth and rarely changes. Occupation, marriage, and rights are tied to caste membership. Intermingling between castes is discouraged or forbidden.',
  'Collectivist': 'The group takes precedence over the individual. Resources and achievements are shared communally. Individual ambition is viewed with suspicion; loyalty to the collective is the highest virtue.',
  'Competitive':  'Driven by rivalry — economic, political, or social. Individuals or families constantly vie for status and resources. Innovation is high but cooperation is low; betrayal is common in dealings.',
  'Cosmopolitan': 'Open, diverse, and outward-looking. Outsiders are welcomed; multiple languages and customs coexist. Trade and cultural exchange are celebrated; insularity is considered backward.',
  'Deceptive':    'Dissembling is culturally accepted or even admired. Agreements are honoured only when convenient. Visitors should assume they are being misled; direct dealing is considered naïve.',
  'Degenerate':   'Social structures are in visible decay. Corruption, excess, and breakdown of shared norms are widespread. The leadership indulges itself while the rest suffer.',
  'Devoted':      'Organised around a powerful faith, ideology, or cause. Members sacrifice personal interests readily. Outsiders who do not share the devotion may be viewed as threats or potential converts.',
  'Egalitarian':  'Social equality is a core value. Titles, inherited wealth, and privilege are viewed with suspicion. Everyone is expected to contribute and receive fair reward.',
  'Elitist':      'Stratified by talent, birth, or achievement — and those at the top are unapologetic about it. Access to power is tightly controlled by a privileged few.',
  'Fatalistic':   'Outcomes are believed to be predetermined — by fate, the stars, or divine will. There is little sense of personal agency. Tragedy is accepted with resignation; risk is taken boldly.',
  'Fearful':      'Chronic fear shapes daily life — of authority, outsiders, or each other. Informants are common. Public behaviour is guarded. Creativity and dissent are suppressed by the constant threat of consequences.',
  'Generous':     'Hospitality and giving are core values. Wealth is measured by how much is given away. Visitors can expect food, shelter, and help; refusing a gift is a serious insult.',
  'Gregarious':   'Outgoing and social. Business is conducted over meals and celebrations. Silence and reserve are read as hostility. Networking is essential to getting anything done.',
  'Heroic':       'Celebrates bold action, personal courage, and decisive leadership. Self-sacrifice for a worthy cause is the highest honour. Caution and compromise are viewed as cowardice.',
  'Honest':       'Directness and truthfulness are paramount virtues. Lying — even polite social lies — is deeply shameful. Negotiations are blunt; what you see is what you get.',
  'Honorable':    'A strict code of personal conduct governs all interactions. Promises made are kept regardless of cost. Insults demand satisfaction. Reputation is everything.',
  'Hospitable':   'Welcoming strangers is a near-sacred duty. Travellers receive food, shelter, and protection as guests. In return, guests must behave with respect; violating hospitality is unforgivable.',
  'Hostile':      'Outsiders are viewed with deep suspicion or open aggression. Trade and diplomacy are grudging. Violence is a common first response to perceived threats.',
  'Idealistic':   'Driven by a vision of a better future — political, spiritual, or philosophical. Pragmatism is subordinated to principle. Grand projects are launched with enthusiasm; results rarely match the vision.',
  'Indifferent':  'Largely apathetic to politics, religion, and outside events. People focus on day-to-day comfort. The community is stable but difficult to mobilise for collective action, good or ill.',
  'Individualist':'Personal freedom and self-determination are paramount. Community obligations are minimal; everyone makes their own way. Privacy is jealously guarded; mutual aid is transactional.',
  'Intolerant':   'Conformity is enforced in belief, appearance, or behaviour. Minorities or those who deviate from norms face discrimination. The dominant group defines what is acceptable.',
  'Isolationist': 'Prefers minimal contact with outsiders. Off-world trade and immigration are restricted. Self-sufficiency is a point of pride. Outsiders are rarely made welcome.',
  'Legalistic':   'Governed by an intricate body of custom applied rigorously. Agreements are everything. Disputes are common and consume years. An advocate is essential for any significant dealings.',
  'Libertarian':  'Personal freedom is the supreme value. Leadership is minimal by design; taxation and regulation are resisted. The individual is sovereign. The resulting community is dynamic, unequal, and occasionally chaotic.',
  'Militarist':   'Military virtues — discipline, strength, sacrifice — dominate culture. A significant fraction of the population serves or has served. Relations with outsiders are assertive; conflict is always a near possibility.',
  'Pacifist':     'Violence is culturally abhorrent. Conflict is resolved through mediation or passive resistance. Defensive forces are minimal. The community may be vulnerable but its internal cohesion is usually high.',
  'Paranoid':     'Lives in fear of hidden enemies — foreign agents, conspirators, or unseen forces. Surveillance is normalised. Strangers are automatically suspect. Accusations of betrayal are common and dangerous.',
  'Piety':        'Religious observance permeates every aspect of daily life. Festivals, prayers, and ritual duties structure the calendar. Offending religious sensibilities — even unknowingly — has serious consequences.',
  'Progressive':  'Embraces change, experimentation, and modernisation. Traditional structures are questioned or dismantled. Innovation is celebrated; rapid social change creates opportunity and instability in equal measure.',
  'Proud':        'Has a strong sense of its own greatness — historical, cultural, or racial. Perceived slights against communal honour are taken very seriously. Admitting weakness is almost impossible.',
  'Rustic':       'Values simplicity, self-reliance, and closeness to the land. Urban sophistication is viewed with suspicion. Hard work, practical skills, and community ties are the true measures of a person.',
  'Ruthless':     'Winning is everything. Compassion and sentiment are luxuries. Competitors are destroyed, not merely defeated. Visitors are advised not to show weakness.',
  'Scheming':     'Political and social life is a labyrinth of alliances, betrayals, and counter-moves. Everyone has an agenda; nothing is said directly. Information is currency. Naïveté is fatal.',
};

// =====================
// Inhabitants Descriptions
// =====================

export const WEALTH_DESCRIPTIONS: Record<WealthLevel, { description: string }> = {
  'Average':    { description: 'The working population meets basic needs with little surplus. Consumer goods are limited; saving is difficult. Standard of living varies widely between regions.' },
  'Better-off': { description: 'An above-average economy with a growing middle class. Basic luxuries are accessible; disposable income exists. Trade is active and investment is beginning to circulate.' },
  'Prosperous': { description: 'A strong economy with significant trade surplus. Luxury goods are available; investment capital circulates freely. Quality of life is high for most citizens.' },
  'Affluent':   { description: 'A wealthy, thriving society with high per-capita income. Premium services are standard; off-world investment is significant. Poverty is minimal; consumption is conspicuous.' },
};

/** QA-025: Low-population terminology variants for populations < 1,000,000 */
export const WEALTH_DESCRIPTIONS_LOW_POP: Record<WealthLevel, { description: string }> = {
  'Average':    { description: 'The population meets basic needs with little surplus. Vital supplies are limited; saving is difficult. Standard of living varies widely between individuals.' },
  'Better-off': { description: 'An above-average fiscal condition with growing specialist groups. Basic luxuries are accessible; disposable income exists. Trade is active and communal resources are beginning to circulate.' },
  'Prosperous': { description: 'A strong fiscal condition with significant trade surplus. Luxury goods are available; communal resources circulate freely. Quality of life is high for most members.' },
  'Affluent':   { description: 'A wealthy, thriving community with high per-capita income. Premium services are standard; off-world support is significant. Hardship is minimal; resource use is conspicuous.' },
};

export const POWER_STRUCTURE_DESCRIPTIONS: Record<PowerStructure, { description: string }> = {
  'Anarchy':       { description: 'No recognised central authority exists. Power is fragmented among local strongmen, warlords, community councils, or guilds. Rules vary by location; travel between zones can be unpredictable.' },
  'Confederation': { description: 'A loose alliance of member-states that retain sovereignty. The central body has limited powers — primarily defence and trade arbitration. Member interests frequently conflict with collective decisions.' },
  'Federation':    { description: 'Member-states have delegated significant powers to a central government. Strong federal institutions co-exist with retained regional identity and local law. The most stable structure for diverse worlds.' },
  'Unitary State': { description: 'A single centralised government rules directly. Regions are administrative divisions, not political entities. Policy is imposed from the top; efficient but can be brittle under stress.' },
};

/** R3: Low-population terminology variants for populations < 1,000,000 */
export const POWER_STRUCTURE_DESCRIPTIONS_LOW_POP: Record<PowerStructure, { description: string }> = {
  'Anarchy':       { description: 'No recognised central authority exists. Power is held by local strong individuals, family heads, or small councils. Rules vary by settlement; travel between areas can be unpredictable.' },
  'Confederation': { description: 'A loose alliance of groups — settlements, clans, or organisations — that retain autonomy. The central body has limited powers, primarily defence and trade arbitration. Group interests frequently conflict with collective decisions.' },
  'Federation':    { description: 'Member groups have delegated significant powers to a central council. Strong communal institutions co-exist with retained local identity and custom. The most stable structure for diverse small communities.' },
  'Unitary State': { description: 'A single centralised leadership rules directly. Local areas are administrative divisions, not political entities. Policy is imposed from the top; efficient but can be brittle under stress.' },
};

/** R3: Low-population display labels for power structure (< 1,000,000) */
export const POWER_STRUCTURE_LABELS_LOW_POP: Record<PowerStructure, string> = {
  'Anarchy': 'Fragmented',
  'Confederation': 'Alliance',
  'Federation': 'Coalition',
  'Unitary State': 'Enclave',
};

export const DEVELOPMENT_DESCRIPTIONS: Record<DevelopmentLevel, { hdi: string; description: string }> = {
  'UnderDeveloped': { hdi: '0.0–0.59', description: 'Subsistence economy dominates. High infant mortality, minimal infrastructure, most of the population engaged in agricultural or extractive labour. Basic literacy and healthcare are patchy. Significant poverty is the norm. (Book p.29)' },
  'Developing':     { hdi: '0.60–0.69', description: 'Industrial base is forming. A middle class is emerging. Access to basic technology — communications, medicine, transport — is becoming widespread. Rural-to-urban migration is accelerating. Inequality is often high during this transition. (Book p.29)' },
  'Mature':         { hdi: '0.70–0.79', description: 'A stable industrial economy with broadly accessible education and healthcare. A consumer economy is growing. Social institutions are functioning but under strain. Life expectancy has improved markedly. (Book p.29)' },
  'Developed':      { hdi: '0.80–0.89', description: 'High standard of living. Service and knowledge economy is dominant. Strong institutions; rule of law is generally reliable. Life expectancy is high; most citizens have access to advanced medical care and education. (Book p.29)' },
  'Well Developed': { hdi: '0.90–0.94', description: 'Post-industrial, technology-intensive economy. High educational attainment across the population. A strong social safety net reduces extreme hardship. Automation handles much routine labour. Off-world investment is common. (Book p.29)' },
  'Very Developed': { hdi: '>0.95', description: 'Near-optimal material conditions. Automation handles most labour; citizens pursue creative, scientific, and exploratory vocations. Inequality is minimal. This society is a significant player in interstellar trade and culture. (Book p.29)' },
};

/** QA-025: Low-population terminology variants for populations < 1,000,000 */
export const DEVELOPMENT_DESCRIPTIONS_LOW_POP: Record<DevelopmentLevel, { hdi: string; description: string }> = {
  'UnderDeveloped': { hdi: '0.0–0.59', description: 'Subsistence framework dominates. High infant mortality, minimal infrastructure, most of the population engaged in agricultural or extractive labour. Basic literacy and healthcare are patchy. Significant deprivation is the norm. (Book p.29)' },
  'Developing':     { hdi: '0.60–0.69', description: 'Industrial base is forming. Specialist groups are emerging. Access to basic technology — communications, medicine, transport — is becoming widespread. Labour mobility is accelerating. Inequality is often high during this transition. (Book p.29)' },
  'Mature':         { hdi: '0.70–0.79', description: 'A stable industrial framework with broadly accessible education and healthcare. Vital supply chains are growing. Social institutions are functioning but under strain. Life expectancy has improved markedly. (Book p.29)' },
  'Developed':      { hdi: '0.80–0.89', description: 'High standard of living. Service and knowledge framework is dominant. Strong institutions; rule of law is generally reliable. Life expectancy is high; most members have access to advanced medical care and education. (Book p.29)' },
  'Well Developed': { hdi: '0.90–0.94', description: 'Post-industrial, technology-intensive framework. High educational attainment across the population. A strong communal safety net reduces extreme hardship. Automation handles much routine labour. Off-world support is common. (Book p.29)' },
  'Very Developed': { hdi: '>0.95', description: 'Near-optimal material conditions. Automation handles most labour; individuals pursue creative, scientific, and exploratory vocations. Inequality is minimal. This community is a significant player in interstellar trade and culture. (Book p.29)' },
};

export const SOURCE_OF_POWER_DESCRIPTIONS: Record<PowerSource, { description: string }> = {
  'Aristocracy': { description: 'Power is held by hereditary noble families or landed gentry. Bloodlines and inheritance determine access to governance. Reform is slow; the system perpetuates itself across generations.' },
  'Ideocracy':   { description: 'Power is legitimised by adherence to an ideology, religion, or doctrine. True believers run the state; deviation from orthodoxy is a political as well as moral offence.' },
  'Kratocracy':  { description: 'Power belongs to the strongest. Might makes right — leadership changes through contest, coup, or demonstrated dominance. Can be dynamic but is inherently unstable.' },
  'Democracy':   { description: 'Power is derived from popular will through elections, referenda, or direct participation. Legitimacy requires ongoing consent of the governed. Prone to short-termism but resilient to abuse.' },
  'Meritocracy': { description: 'Power is awarded to those who demonstrate competence through examination, achievement, or proven track record. Efficient and innovative, but risks creating a self-perpetuating technocratic elite.' },
};

/** R3: Low-population terminology variants for populations < 1,000,000 */
export const SOURCE_OF_POWER_DESCRIPTIONS_LOW_POP: Record<PowerSource, { description: string }> = {
  'Aristocracy': { description: 'Power is held by hereditary family heads or elders. Bloodlines and seniority determine access to governance. Reform is slow; the system perpetuates itself across generations.' },
  'Ideocracy':   { description: 'Power is legitimised by adherence to an ideology, religion, or doctrine. True believers lead the community; deviation from orthodoxy is a political as well as moral offence.' },
  'Kratocracy':  { description: 'Power belongs to the strongest. Might makes right — leadership changes through contest, coup, or demonstrated dominance. Can be dynamic but is inherently unstable.' },
  'Democracy':   { description: 'Power is derived from popular will through assemblies, votes, or direct participation. Legitimacy requires ongoing consent of the governed. Prone to short-termism but resilient to abuse.' },
  'Meritocracy': { description: 'Power is awarded to those who demonstrate competence through achievement or proven track record. Efficient and innovative, but risks creating a self-perpetuating elite.' },
};

/** R3: Low-population display labels for source of power (< 1,000,000) */
export const SOURCE_OF_POWER_LABELS_LOW_POP: Record<PowerSource, string> = {
  'Aristocracy': 'Elders',
  'Ideocracy': 'Doctrine',
  'Kratocracy': 'Dominant',
  'Democracy': 'Assembly',
  'Meritocracy': 'Proven',
};

