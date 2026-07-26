/**
 * THE ALMANAC — historical notes unlocked by poking at the world.
 *
 * Ground rules for every entry here:
 *  - It is true, and it is about *ordinary life*: what people ate, what they earned, what
 *    they wore, what the law did to them on a Tuesday.
 *  - It is written straight. The game jokes; the almanac does not. When a player stops to
 *    read one of these, they should be getting the real thing.
 *  - Where a figure is disputed or a story is legend rather than record, it says so.
 *
 * Unlocked by `{ op: 'LORE', id }` from any script.
 */

export interface LoreEntry {
	id: string;
	title: string;
	category: 'Money' | 'Table' | 'House' | 'Dress' | 'Work' | 'Law' | 'Faith' | 'People' | 'Town';
	body: string;
	/** Where the game is being loose with the record, or where historians disagree. */
	caveat?: string;
}

export const ALMANAC: LoreEntry[] = [
	/* ------------------------------------------------------------- MONEY */
	{
		id: 'sewant',
		title: 'Shell money',
		category: 'Money',
		body: 'New Netherland ran on *sewant* — wampum: shell beads drilled and strung by Long Island and Sound peoples. White beads came from whelk shells, purple from the quahog clam, and purple was worth roughly double because the coloured part of the shell is small and drilling it without shattering it is skilled work. The Dutch made it legal tender because the West India Company never shipped enough coin. By the 1650s the colony was suffering real inflation as poorly-made beads flooded in, and the government kept issuing rates to prop it up. In 1650 the official rate was six white beads to the stuiver; by 1659 it was sixteen.',
		caveat: 'Exact rates varied by year, place and who was doing the arguing.'
	},
	{
		id: 'guilder',
		title: 'What a guilder was worth',
		category: 'Money',
		body: 'A guilder was twenty stuivers. A labourer in New Amsterdam might earn one guilder a day; a skilled carpenter or mason two to three. A soldier of the Company earned around eight to ten guilders a *month*, plus board — which is why so many of them deserted, drank, or married into a trade at the first opportunity. Four hundred guilders was therefore something like a year and a half of a working man\'s entire wages, with nothing spent on food.'
	},
	{
		id: 'beaver',
		title: 'The pelt standard',
		category: 'Money',
		body: 'The whole colony existed for one animal. A prime beaver pelt was the real unit of account — debts, land and fines were all quoted in beavers as readily as in guilders, at roughly eight guilders a skin. New Netherland shipped something like 35,000 pelts in a single good year in the 1650s. The hats they became were felted in Europe from beaver underfur, and the fashion held long enough to nearly exterminate the animal east of the Mississippi.'
	},

	/* ------------------------------------------------------------- TABLE */
	{
		id: 'beer',
		title: 'Small beer for breakfast',
		category: 'Table',
		body: 'Everyone drank beer, including children, at every meal, starting with breakfast. This was not debauchery: it was water safety. "Small beer" was weak — brewed from a second mash, perhaps two percent alcohol — and it was the sanitary option in a town whose wells sat downhill from its privies and its pig yards. New Amsterdam had a brewery on Brouwer Street (Stone Street) from the 1630s. Strong beer, jenever and imported French wine were what you drank on purpose.'
	},
	{
		id: 'oysters',
		title: 'Oysters everywhere',
		category: 'Table',
		body: 'The harbour held an estimated 220,000 acres of oyster beds — perhaps half the world\'s oysters. They grew to nearly a foot long. They were poor people\'s food: so abundant that shells were burned for lime and paved into roads, and the middens left by Lenape communities over centuries were metres deep. A New Amsterdam labourer ate oysters the way a modern one eats bread.'
	},
	{
		id: 'diet',
		title: 'What was actually on the table',
		category: 'Table',
		body: 'Bread of rye or maize, butter, cheese, salt pork, peas. *Sappaen* — cornmeal mush, taken straight from Lenape cooking and eaten with milk — became so standard in Dutch New York households that it survived as a regional dish into the nineteenth century. Colonists also took maize, beans, squash, cranberries and pumpkin from their Indigenous neighbours, and the borrowing was almost entirely one-directional in the kitchen even while the politics ran the other way.'
	},
	{
		id: 'koekje',
		title: 'Words you already know',
		category: 'Table',
		body: 'Dutch New Amsterdam left its groceries in English. *Koekje* became "cookie". *Krulkoek* and *oliekoek* — fried dough in fat — became the doughnut. *Koolsla*, cabbage salad, became "coleslaw". *Pannekoek*, *waffel*, *pit*, *brandy* from *brandewijn*. Also "boss" from *baas*, "stoop" from *stoep*, and the Dutch habit of calling any small stream a *kill* — which is why New York still has Catskill, Fishkill and Peekskill.'
	},

	/* ------------------------------------------------------------- HOUSE */
	{
		id: 'houses',
		title: 'Yellow brick and stepped gables',
		category: 'House',
		body: 'The better houses stood gable-end to the street, in the Amsterdam manner, with stepped or spout gables and small leaded windows. Much of the brick genuinely was shipped from the Netherlands — not, as the old story goes, because there was no clay here, but because bricks made excellent paying ballast on an outbound ship that would return heavy with pelts. Roofs were tile or thatch; thatch was banned near chimneys after the fires.'
	},
	{
		id: 'fire',
		title: 'Fire wardens and the leather bucket',
		category: 'House',
		body: 'A town of timber, thatch and open hearths burns. From 1648 New Amsterdam appointed fire wardens who could inspect any chimney and fine a dirty one twenty-five guilders, and the money bought leather buckets, hooks and ladders. Every household was expected to keep buckets filled. The *klapperman* — the rattle watch — patrolled at night calling the hours and sounding a wooden rattle for fire, a job the town paid badly and complained about constantly.'
	},
	{
		id: 'privy',
		title: 'The pigs and the privies',
		category: 'House',
		body: 'New Amsterdam had a sanitation problem it legislated at endlessly and never solved. Householders threw waste into the street; pigs and goats ran loose and ate it; ordinances in the 1650s repeatedly banned dumping "rubbish, filth, ashes, dead animals" in the public way, and repeatedly had to be reissued, which tells you how well the last one worked. Privies were required to be dug a set distance from a neighbour\'s wall, and the court records are full of neighbours who disagreed about the distance.'
	},

	/* -------------------------------------------------------------- DRESS */
	{
		id: 'clothing',
		title: 'What people wore',
		category: 'Dress',
		body: 'Men: a linen shirt, a doublet or jerkin, baggy knee breeches, knitted stockings, a broad-brimmed felt hat, and shoes with a buckle or tie. Women: a linen shift, a laced bodice, several petticoats — worn in layers for warmth, the outer one often quilted — an apron, and a linen cap. Colour was not the sober black of the paintings: Dutch inventories list russet, green, blue and murrey. Black was expensive to dye well, which is exactly why the rich wore it for portraits.'
	},
	{
		id: 'laundry',
		title: 'Linen, lye and the Monday wash',
		category: 'Dress',
		body: 'Outer clothes were essentially never washed — they were brushed, aired and mended for years. Linen underclothes were washed, and *that* was how you were clean: changing your shift was the seventeenth-century equivalent of bathing. Washing meant lye made from wood ash, hot water hauled by the bucket, and a full day\'s labour, which is why it happened in bulk and why a household\'s linen count was a genuine measure of its wealth.'
	},

	/* --------------------------------------------------------------- WORK */
	{
		id: 'taverns',
		title: 'A town of tap-houses',
		category: 'Work',
		body: 'In 1648 Stuyvesant complained that a quarter of the buildings in New Amsterdam had been turned into taverns, tap-houses or brandy shops. He was probably not exaggerating much. Tapping was one of the few trades open to a woman in her own name, and widows ran a great many of the houses. The town regulated opening hours, Sunday trading and selling to soldiers on credit — and prosecuted people for all three, continuously, without visible effect.'
	},
	{
		id: 'women-trade',
		title: 'Women in business',
		category: 'Work',
		body: 'Roman-Dutch law gave women a legal position their English-colony contemporaries did not have. A married woman could trade as a *koopvrouw* in her own name, sign contracts, sue and be sued. Marriage could be made in community of property, with the survivor inheriting the whole; widows commonly carried on the family business. New Amsterdam court records show women as plaintiffs, defendants, creditors and traders as a matter of routine. When the English took the colony in 1664 and imposed common-law coverture, Dutch women in New York measurably lost ground.'
	},
	{
		id: 'trades',
		title: 'The trades of the town',
		category: 'Work',
		body: 'Roughly 1,500 people by the mid-1650s, and among them coopers, carpenters, bakers, brewers, smiths, wheelwrights, shoemakers, tailors, tanners, sailmakers, gunstock makers, a schoolmaster, a surgeon or two, and a great many people who did all of it in rotation depending on which ship was in. Guild structure was weak compared with the home cities, which meant more mobility between trades and more spectacular incompetence in all of them.'
	},

	/* ---------------------------------------------------------------- LAW */
	{
		id: 'schout',
		title: 'The schout, the burgomasters and the schepenen',
		category: 'Law',
		body: 'New Amsterdam got municipal government in February 1653: a *schout* (sheriff and prosecutor in one), two burgomasters and five schepenen sitting as a court. They met weekly, heard everything from debt to slander to assault, and spent much of their energy fighting the Director-General over money and jurisdiction. Their minute books survive, and they are the single best window into what ordinary life in the town was actually like — mostly people suing each other over pigs, fences, and things said in a tavern.'
	},
	{
		id: 'slander',
		title: 'Sued for what you said',
		category: 'Law',
		body: 'Reputation was property, and the court took it seriously. Calling a man a thief or a woman a whore in the street could and did land you in front of the schepenen, and the standard penalty was a fine plus a public retraction: the offender had to stand and declare that they knew the other party to be honest and honourable. New Amsterdam\'s records are thick with these cases. It was, in effect, a working defamation system for a town where everyone drank together.'
	},
	{
		id: 'punishment',
		title: 'The whipping post and the wooden horse',
		category: 'Law',
		body: 'Punishment was public and physical: fines first, then flogging, branding, banishment, or the pillory. Soldiers got the *wooden horse* — a sharp-ridged trestle you were made to sit astride, sometimes with weights tied to your feet, for hours. It was a standard military punishment across Europe and it did permanent damage. Naming a tavern after it is the kind of joke a garrison town makes.'
	},

	/* -------------------------------------------------------------- FAITH */
	{
		id: 'church',
		title: 'One church, officially',
		category: 'Faith',
		body: 'The Dutch Reformed Church was the only faith permitted public worship. Everyone else — Lutherans, Quakers, Catholics, Jews — was in theory tolerated in private conscience and in practice harassed whenever Stuyvesant felt strongly, which was often. The Company in Amsterdam repeatedly overruled him, less from principle than because religious quarrels were bad for immigration and worse for trade. The 1657 Flushing Remonstrance, in which a village of English settlers refused an order to bar Quakers, is one of the earliest colonial statements of religious liberty in North America.'
	},
	{
		id: 'jews',
		title: 'The twenty-three',
		category: 'Faith',
		body: 'In September 1654 twenty-three Jewish refugees arrived from Recife, fleeing the Portuguese reconquest of Dutch Brazil. Stuyvesant wrote to Amsterdam asking leave to expel them. In April 1655 the Company directors refused: the Jewish community had suffered losses in Brazil, and — the letter says so plainly — Jewish investors held a considerable stake in the Company\'s stock. They were permitted to stay on condition their poor were supported by their own community. It is a founding moment of Jewish life in North America and it was decided, on the record, as a shareholder matter.'
	},

	/* ------------------------------------------------------------- PEOPLE */
	{
		id: 'half-freedom',
		title: 'Half-freedom',
		category: 'People',
		body: 'The West India Company held enslaved Africans in New Amsterdam from 1626. They cleared the land, built the fort, cut the road up the island and built the wall of 1653. In February 1644, eleven men — among them Paulo d\'Angola, Big Manuel, Simon Congo and Anthony Portuguese — petitioned after roughly eighteen years of service and were granted "half-freedom": land along the wagon road that became the Bowery, personal liberty, and an annual tribute in produce and pelts. The condition was that their children remained the Company\'s property. Their farms formed the first free Black landholding community in what is now Manhattan.',
		caveat: 'The 1644 grant\'s exact terms are recorded; how they were enforced in later years is less clear, and some children were later freed by individual manumission.'
	},
	{
		id: 'lenape',
		title: 'Whose island',
		category: 'People',
		body: 'Manhattan was Lenape land — Munsee-speaking communities with settlements, planting fields, fishing camps and trails, some of which the Dutch simply paved. The famous 1626 "purchase" for sixty guilders of trade goods was almost certainly understood by the two sides as entirely different transactions: a permanent alienation of land on one, and something closer to a use-and-alliance agreement on the other. The document usually cited does not name the seller, and no deed survives.',
		caveat: 'The "24 dollars" figure is a nineteenth-century conversion and close to meaningless.'
	},
	{
		id: 'kieft',
		title: "Kieft's War",
		category: 'People',
		body: 'In February 1643, Director Willem Kieft — trying to extract a tribute the Lenape had refused — sent soldiers across the North River at night to Pavonia and to Corlears Hook. They killed around 120 people, mostly women, children and the elderly, in their sleep. The war that followed ran to 1645, cost hundreds of lives on both sides, emptied outlying farms, and nearly destroyed the colony. Kieft was recalled and drowned on the voyage home. Stuyvesant arrived in 1647 to govern what that had left behind.'
	},
	{
		id: 'languages',
		title: 'Eighteen languages',
		category: 'People',
		body: 'The Jesuit Isaac Jogues, passing through in 1643, reported hearing eighteen languages spoken in a settlement of a few hundred people. New Amsterdam was Dutch, Walloon, French, German, English, Scandinavian, Portuguese-Jewish and African, plus the Munsee and Mohawk of visiting traders. It was, from the beginning, less a Dutch town than a Company port that happened to be run in Dutch — which is a substantial part of why New York turned out the way it did.'
	},

	/* --------------------------------------------------------------- TOWN */
	{
		id: 'the-wall',
		title: 'The wall on Wall Street',
		category: 'Town',
		body: 'Built in 1653, when war between England and the Dutch Republic raised the fear of an attack from New England. It ran roughly 2,340 feet across the island: a palisade of split logs twelve feet high with an earth breastwork, pierced by a land gate on the Broad Way and a water gate at Pearl Street. Much of the labour was done by enslaved men owned by the Company. No attack ever came overland. When the English took the town in 1664 they arrived by sea, anchored off the fort, and the wall was not involved. The English pulled it down in 1699.'
	},
	{
		id: 'pearl-street',
		title: 'Why it is called Pearl Street',
		category: 'Town',
		body: 'Because of the oyster shells. Pearl Street was the shoreline — the East River lapped it, and the strand was thick with mother-of-pearl from centuries of shell middens. Everything east of it in modern Manhattan is landfill. Nearby: the Broad Way, following an old Lenape trail up the island; Brouwer Street for the breweries; Hoogh Straet, Marckvelt, the Sheep Pasture. The street plan of the financial district is still, in outline, the plan of a Dutch company town of 1,500 people.'
	},
	{
		id: 'fort',
		title: 'A fort that never worked',
		category: 'Town',
		body: 'Fort Amsterdam was begun in 1625 and was a scandal for its entire existence. Built of earth and rubble rather than stone, it was eroded by rain, undermined by the goats and pigs that grazed on its ramparts, and repeatedly reported as indefensible. Inside stood the church, the Director-General\'s house, the barracks and the gallows. In 1664 it surrendered without a shot, partly because the burghers pointed out that the powder magazine was in poor order and the town would simply be destroyed for nothing.'
	},
	{
		id: 'stuyvesant',
		title: 'Petrus Stuyvesant',
		category: 'Town',
		body: 'Director-General from 1647 to 1664. Son of a Reformed minister from Friesland; lost his right leg to a cannonball at Saint Martin in 1644 and wore a wooden replacement, which contemporary account and long tradition describe as banded or studded with silver. Autocratic, incorruptible, tireless and frequently wrong. He built the wall, regulated the taverns, tried to expel the Lutherans, the Quakers and the Jews, was overruled from Amsterdam each time, and surrendered the colony in 1664 over the objection of nobody except himself. He is buried at St. Mark\'s Church in-the-Bowery, on his own farm.',
		caveat: 'The silver banding is well attested in tradition and period description; the surviving leg fragments do not settle it.'
	},
	{
		id: 'peach-war',
		title: 'The Peach Tree War',
		category: 'Town',
		body: 'On 15 September 1655, while Stuyvesant was on the Delaware with some 300 soldiers taking New Sweden, a large force — several hundred Susquehannock, Lenape and allied warriors — came into the undefended town by canoe. Fighting spread to Pavonia and Staten Island. Around fifty colonists were killed, over a hundred taken captive, and outlying farms burned. Dutch accounts blamed the killing of a Lenape woman by Hendrick van Dyck, who had shot her for taking peaches from his orchard some weeks before. The peach story may be a convenient explanation for a raid with much older causes.',
		caveat: 'Casualty figures vary by source; the peach incident is recorded but its role as *the* cause is contested by historians.'
	},
	{
		id: 'profit',
		title: 'It never made money',
		category: 'Town',
		body: 'For all of it — the wall, the fort, the pelts, the shell money, the ordinances, the wars — New Netherland never returned a profit to the West India Company across its forty-year existence. The Company\'s money was made in the Atlantic slave trade and in Brazilian sugar, and when Brazil was lost the Company was effectively finished. New Amsterdam, the settlement it neglected, underfunded and repeatedly considered abandoning, is the only part of the enterprise anyone now remembers.'
	},

	/* ==================================================================== */
	/* ACT II — the money, the trades that made it, and the ones that faked */
	/* ==================================================================== */

	{
		id: 'wampum-making',
		title: 'How a bead was actually made',
		category: 'Money',
		body: 'White came from the thick central pillar of a whelk shell — the only part solid enough to survive being worked. Purple came from the dark patch on the lip of a quahog clam, and there is very little of it on any one shell, which is the entire reason purple was worth about double. The blank was ground round on a stone and then drilled, using a hand- or bow-turned drill of stone or reed with wet sand as the cutting grit. A skilled maker could produce perhaps a hundred beads in a long day and would break a good number of them. Finished beads ran about a quarter of an inch long. They were strung on sinew or fibre, and the standard unit of account was the *fathom* — six feet of strung beads.',
		caveat: 'Output figures are estimates from ethnographic and archaeological work, not from anybody\'s account book.'
	},
	{
		id: 'long-island',
		title: 'Where the money came from',
		category: 'Money',
		body: 'Almost all of it was made on Long Island and around Long Island Sound, by Montaukett, Shinnecock, Massapequa, Pequot, Narragansett and neighbouring communities with access to the right shell beaches. The Dutch called Long Island *Sewanhacky*, which is usually glossed as the island of shells. New Netherland\'s entire small-change supply therefore depended on the labour of people the colony did not govern, could not compel, and was frequently at odds with — a fact the Dutch record notices only when the supply is interrupted.',
		caveat: 'The *Sewanhacky* etymology is traditional and reasonable but not certain.'
	},
	{
		id: 'sewant-rate',
		title: 'Legislating what money is worth',
		category: 'Money',
		body: 'Because sewant was legal tender and nobody minted it, the government kept trying to fix its value by proclamation. New Netherland ordinances set a rate — famously six white beads to the stuiver around 1650 — and distinguished "strung" wampum from "loose", the loose stuff being worth less because it had not been sorted. It never held. Poor beads kept arriving, the good ones were hoarded or exported, and each new rate was an admission that the last one had failed. By the end of the 1650s the official rate had roughly halved again, and by the 1660s sewant had collapsed as a serious currency.',
		caveat: 'Rates differed by ordinance, by year and by jurisdiction; the numbers in the record do not form one tidy series.'
	},
	{
		id: 'counterfeit',
		title: 'Faking the money',
		category: 'Law',
		body: 'People counterfeited wampum more or less immediately. The commonest fraud was dyeing cheap white beads to pass as the valuable purple; others made beads from stone, bone, horn or European glass. Both the Dutch and the New England colonies legislated against bad and unstrung wampum repeatedly. The deeper problem was not fraud but productivity: Europeans introduced steel drills, and later machinery, and could make beads far faster and more uniformly than hand production ever could — which flooded the supply and helped destroy the value of the thing they were counterfeiting.',
		caveat: 'Dyed counterfeits are attested in period complaints; how common they were is impossible to quantify.'
	},
	{
		id: 'logwood',
		title: 'The forbidden purple',
		category: 'Work',
		body: 'Logwood — *Haematoxylum campechianum*, also called blockwood or Campeche wood — comes from Central America and gives magnificent purples, blues and blacks. It was also notoriously *fugitive*: badly mordanted, the colour faded or washed out. England banned it outright in 1581 as a "false and deceitful" dye and ordered stocks burnt, a prohibition not lifted until 1662, by which time dyers had learned to fix it properly. Cutting logwood in the Bay of Campeche and along the Central American coast became a large, semi-piratical English business over the second half of the century.',
		caveat: 'The English ban and its 1662 repeal are firm. The game gives a New Haven smuggler a supply in 1655, which is a few years early for the trade at its height.'
	},
	{
		id: 'dyeing',
		title: 'Mordants, and the tub behind the shed',
		category: 'Dress',
		body: 'A dye that merely sits on a fibre washes out. To hold, most dyes need a *mordant* — alum, iron, tannin — that binds dye to material. Alum had to be imported and cost money; stale urine did not. Left standing, urine turns alkaline and ammoniacal, and it was used across Europe for scouring wool, for fulling cloth, and in the indigo and woad vats. Households collected it and dyers, fullers and tanners bought it by the bucket. The Roman emperor Vespasian is said to have taxed the trade in it, and when his son objected, to have held up a coin and asked whether it smelled.',
		caveat: 'The Vespasian story comes from Suetonius and may be a good anecdote rather than a true one.'
	},
	{
		id: 'tanners',
		title: 'The trade nobody wants next door',
		category: 'Work',
		body: 'Tanning turns a hide into leather over months or years. The hair is stripped with lime, the skin softened in a bath of dung, and then the hides are layered with ground oak bark in sunken pits and left — six months for light leather, two years or more for sole leather. It stinks so badly that towns across Europe legislated tanneries to the far side of the walls, downwind and downstream. New Amsterdam did the same, ordering its tanners repeatedly to move away from the built-up town and the canal. They were also indispensable: every shoe, belt, harness, bucket and bellows in the colony came out of one of those pits.',
		caveat: 'The town issued several orders about tanneries over the 1650s; the exact sequence and how far they were obeyed is muddled in the record.'
	},
	{
		id: 'turner',
		title: 'The pole lathe',
		category: 'Work',
		body: 'A pole lathe is a springy sapling fixed above the workpiece, a cord wrapped round it and running down to a foot treadle. Press the treadle and the work spins toward the chisel and cuts; release it and the pole hauls it back. The motion is reciprocating, not continuous, so you cut on the down-stroke only — but it needs no water, no wheel and no capital beyond a tree. Turners made chair legs, bowls, tool handles, bungs and spindles on them for centuries. In a colonial town the same man was often the gunstock-maker, because boring a straight small hole was his particular skill.'
	},
	{
		id: 'market',
		title: 'Market day',
		category: 'Town',
		body: 'New Amsterdam established a regular weekly market in the late 1640s and later a market field — the Marckvelt, near the fort — along with annual free fairs for cattle and hogs in the autumn. The point of a fair was legal as much as commercial: for its duration, outsiders could trade in town under protections they did not otherwise have. Manhattan still carries the name: Marketfield Street runs a crooked hundred yards off Broad Street, and it is there because of a seventeenth-century Dutch cattle market.',
		caveat: 'Dates for the market\'s founding and its moves vary between sources.'
	},
	{
		id: 'weigh-house',
		title: 'The weigh-house',
		category: 'Town',
		body: 'Any Dutch town of consequence had a *waag* — a public weigh-house with an official beam-scale, where goods sold by weight were weighed by a sworn weigh-master for a fee. It was a revenue device and a trust device at once: private scales could be argued with, and the public beam could not. New Amsterdam set up its own in the 1650s near the waterfront. It is a small, telling thing about how a market town works — the community will fight about almost anything, but it agrees in advance to believe one particular piece of iron.'
	},
	{
		id: 'brouwer-street',
		title: 'The first paved street',
		category: 'Town',
		body: 'Brouwer Straat — Brewers\' Street — was where the breweries clustered, and in 1658 it became the first street in New Amsterdam to be paved with cobblestones, reportedly after the residents petitioned and helped pay for it, because the carts and the mud together had made it impassable. It is still there. It is now called Stone Street, and it is named after the paving.'
	},
	{
		id: 'duffel',
		title: 'Duffel cloth',
		category: 'Dress',
		body: 'The single most important thing the Dutch had to trade was not beads or guns but *duffel* — a thick, coarse, heavily napped woollen cloth named for the town of Duffel near Antwerp. It was warm, hard-wearing, took dye well and needed no tailoring to be useful, and it appears in New Netherland trade accounts constantly, usually by the ell in red or blue. Native people across the northeast adopted it quickly and on their own terms, cutting and wearing it in their own forms rather than European ones, and traders learned that quality and colour mattered to their customers a great deal more than they had assumed.'
	},
	{
		id: 'mattaneck-note',
		title: 'A note on this character',
		category: 'People',
		body: 'Mattaneck is invented, and deliberately so. The Dutch records of the 1640s and 1650s name a great many real Munsee, Lenape and Long Island people — Oratam of the Hackensack, Tackapousha of the Massapequa, Mattano, Penhawitz and others — who negotiated, traded, signed deeds and argued with the colony on the record. This game does not put invented dialogue, an invented scheme or an invented change of heart into the mouth of any of them. The design document for this project originally named a documented sachem for this role; that was changed for exactly this reason. Everything Mattaneck says about how sewant was made, what it was worth, and who lost when its value fell is drawn from the historical record. Mattaneck himself is not.'
	}
];

export const ALMANAC_BY_ID: Record<string, LoreEntry> = Object.fromEntries(
	ALMANAC.map((e) => [e.id, e])
);

export const ALMANAC_CATEGORIES = [
	'Town',
	'People',
	'Money',
	'Table',
	'House',
	'Dress',
	'Work',
	'Law',
	'Faith'
] as const;
