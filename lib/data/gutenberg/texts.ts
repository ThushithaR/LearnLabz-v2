/**
 * Gutenberg Corpus - Static Text Data
 * These are real texts from Project Gutenberg (truncated for performance)
 * Used for frontend-only simulation of NLTK corpus access
 */

export const gutenbergTexts: Record<string, string> = {
  "austen-emma.txt": `EMMA

By Jane Austen

VOLUME I

CHAPTER I

Emma Woodhouse, handsome, clever, and rich, with a comfortable home
and happy disposition, seemed to unite some of the best blessings of
existence; and had lived nearly twenty-one years in the world with
very little to distress or vex her.

She was the youngest of the two daughters of a most affectionate,
indulgent father; and had, in consequence of her sister's marriage,
been mistress of his house from a very early period. Her mother had
died too long ago for her to have more than an indistinct remembrance
of her caresses; and her place had been supplied by an excellent
woman as governess, who had fallen little short of a mother in
affection.

Sixteen years had Miss Taylor been in Mr. Woodhouse's family, less as
a governess than as a friend, very fond of both her charges, but
especially of Emma. Between them it was more the intimacy of sisters.
Even before Miss Taylor had ceased to hold the nominal office of
governess, the mildness of her temper had hardly allowed her to impose
any restraint; and the shadow of authority being removed, she became,
in the change of situation which followed on her marriage, her equal
in consideration.`,

  "shakespeare-macbeth.txt": `THE TRAGEDY OF MACBETH

By William Shakespeare

DRAMATIS PERSONAE.

DUNCAN, King of Scotland.
MACBETH, generals
BANQUO, [in the King's army.]
MACDUFF,
LENNOX,
ROSS,    nobleman
MENTEITH, of Scotland
ANGUS,
CAITHNESS,
FLEANCE, son to Banquo.
SIWARD, Earl of Northumberland.
YOUNG SIWARD, his son.
SEYTON, an officer attending on Macbeth.
AN ENGLISH DOCTOR.
A SCOTTISH DOCTOR.
A PORTER.
AN OLD MAN.

LADY MACBETH.
LADY MACDUFF.

HECATE.
THREE WITCHES.
APPARITIONS.

Lords, Gentlemen, Officers, Soldiers, Murderers, Attendants, and Messengers.

SCENE.—In the end of the play, in England; through the rest of the play,
in Scotland.

MACBETH.

ACT I.

SCENE I. A desert place.

[Thunder and lightning. Enter three WITCHES]

FIRST WITCH. When shall we three meet again
In thunder, lightning, or in rain?

SECOND WITCH. When the hurlyburly's done,
When the battle's lost and won.

THIRD WITCH. That will be ere the set of sun.

FIRST WITCH. Where the place?

SECOND WITCH. Upon the heath.

THIRD WITCH. There to meet with Macbeth.

FIRST WITCH. I come, Graymalkin!

SECOND WITCH. Paddock calls.

THIRD WITCH. Anon.

ALL. Fair is foul, and foul is fair:
Hover through the fog and filthy air.
[Exeunt]`,

  "bible-kjv.txt": `THE HOLY BIBLE

King James Version

The First Book of Moses: Called Genesis

CHAPTER 1

1 In the beginning God created the heaven and the earth.
2 And the earth was without form, and void; and darkness was upon
the face of the deep. And the Spirit of God moved upon the face of
the waters.
3 And God said, Let there be light: and there was light.
4 And God saw the light, that it was good: and God divided the light
from the darkness.
5 And God called the light Day, and the darkness he called Night. And
the evening and the morning were the first day.
6 And God said, Let there be a firmament in the midst of the waters,
and let it divide the waters from the waters.
7 And God made the firmament, and divided the waters which were under
the firmament from the waters which were above the firmament: and it
was so.
8 And God called the firmament Heaven. And the evening and the morning
were the second day.`,

  "melville-moby-dick.txt": `MOBY-DICK

or, THE WHALE

By Herman Melville

ETYMOLOGY.

(Supplied by a Late Consumptive Barber to the Whale-ship Acushnet.)

Cetology is the science of whale-hunting, and among the whalers of the
world the moby-dick is a legend of considerable import. Every whaler
has heard of Moby Dick—the great white whale; some believe him to be
ubiquitous, some that he is immortal.

EXTRACTS.

(Supplied by a Sub-Sub-Librarian.)

"Call me Ishmael. Some years ago—never mind how long precisely—having
little or no money in my purse, and nothing particular to interest me
on shore, I thought I would sail about a little and see the watery
part of the world. It is a way I have of driving off the spleen, and
regulating the circulation. Whenever I find myself growing grim about
the mouth; whenever it is a damp, drizzly November in my soul; whenever
I find myself involuntarily pausing before coffin warehouses, and
bringing up the rear of every funeral I meet; and especially whenever
my hypos get such an upper hand of me, that it requires a strong moral
principle to prevent me from deliberately stepping into the street, and
methodically knocking people's hats off—then, I account it high time to
get to sea as soon as I can."`,

  "carroll-alice.txt": `ALICE'S ADVENTURES IN WONDERLAND

By Lewis Carroll

CHAPTER I.
Down the Rabbit-Hole.

Alice was beginning to get very tired of sitting by her sister on the
bank, and of having nothing to do: once or twice she had peeped into
the book her sister was reading, but it had no pictures or
conversations in it, "and what is the use of a book," thought Alice,
"without pictures or conversation?"

So she was considering in her own mind (as well as she could, for the
hot day made her feel very sleepy and stupid), whether the pleasure of
making a daisy-chain would be worth the trouble of getting up and
picking the daisies, when suddenly a White Rabbit with pink eyes ran
close by her.

There was nothing so very remarkable in that; nor did Alice think it so
very much out of the way to hear the Rabbit say to itself, "Oh dear!
Oh dear! I shall be too late!" (when she thought it over afterwards,
it occurred to her that she ought to have wondered at this, but at the
time it all seemed quite natural); but when the Rabbit actually took a
watch out of its waistcoat-pocket, and looked at it, and then hurried
on, Alice started to her feet, for it flashed across her mind that she
had never before seen a rabbit with either a waistcoat-pocket, or a
watch to take out of it, and burning with curiosity, she ran across
the field after the Rabbit, never considering how in the world she was
to get in again.`,
};

export const fileIds = Object.keys(gutenbergTexts);

export default gutenbergTexts;
