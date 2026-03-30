import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES, getDaysUntilNextPeriod, SYMPTOMS } from '../utils/cycleUtils';
import { MessageCircle, Send, Sparkles, Heart, Bot, User, Loader2, Flower2, Settings, X, Zap } from 'lucide-react';

// Backend AI API call with timeout
async function callOpenAI(messages, phaseInfo, user) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      body: JSON.stringify({
        messages,
        phaseInfo,
        user,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Backend timeout - please start backend server');
    }
    throw new Error(error.message || 'Backend unavailable');
  }
}

// AI response generator (simulated - in production, replace with actual API call)
function generateResponse(message, phaseInfo, user) {
  const lowerMsg = message.toLowerCase();
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : null;
  const daysUntil = getDaysUntilNextPeriod(user?.lastPeriodStart, user?.cycleLength);
  const userName = user?.name?.split(' ')[0] || 'lovely';

  // Greeting
  if (lowerMsg.match(/^(hi|hello|hey|good morning|good evening|good afternoon|sup|howdy|hola)/)) {
    const greetings = [
      `Hey there, ${userName}! 🌸 I'm Utaura, your wellness companion. How are you feeling today?`,
      `Hi beautiful! 💕 Welcome back. You're on day ${phaseInfo?.totalDay || '?'} of your cycle${currentPhase ? ` (${currentPhase.name} phase)` : ''}. What can I help you with?`,
      `Hello ${userName}! 🌷 I'm here for you. Whether it's cycle questions, symptom advice, or just a chat — I'm all ears!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you / how do you feel
  if (lowerMsg.match(/^(how are you|how do you|how r u|what's up|whats up|how have you been)/)) {
    return `I'm doing great, thank you for asking ${userName}! 🌸💕 I'm always here and ready to help you feel your best. More importantly — how are **you** feeling today? Anything on your mind? ✨`;
  }

  // What can you do / help
  if (lowerMsg.match(/(what can you|what do you|how can you help|what are you|who are you|your name|about you|capabilities)/)) {
    return `I'm **Utaura** 🌸, your personal wellness companion! Here's everything I can help you with:\n\n🩸 **Cycle & Period** — Predictions, tracking, irregular periods\n😣 **Symptoms** — Cramps, bloating, headaches, nausea, back pain\n😢 **Emotions** — Mood swings, anxiety, stress, PMS/PMDD\n🥗 **Nutrition** — Phase-specific diet, cravings, supplements\n🏃‍♀️ **Exercise** — Cycle-aware workouts, yoga poses\n😴 **Sleep** — Tips for better rest during your cycle\n💼 **Work** — Productivity optimization by phase\n💊 **Health** — PCOS, endometriosis, contraception, fertility\n🧴 **Skin & Body** — Acne, weight changes, breast tenderness\n🧘 **Self-care** — Meditation, mindfulness, relaxation\n💕 **Relationships** — Communication tips, intimacy\n👩‍⚕️ **Doctor** — When to see a doctor, what to ask\n\nJust ask me anything — I'm here for you! 💕`;
  }

  // Period/cycle prediction
  if (lowerMsg.match(/(when.*(period|next|cycle)|next.*(period|cycle)|predict|period.*(coming|start|due|late|early|arrive))/)) {
    if (daysUntil !== null) {
      if (phaseInfo?.phase === 'MENSTRUATION') {
        return `You're currently on your period, day ${phaseInfo.day} 🩸 Take it easy, lovely. Remember to stay warm and hydrated. Your next cycle is expected to start in about ${daysUntil} days. Need any period comfort tips? 💕`;
      }
      return `Based on your ${user?.cycleLength || 28}-day cycle, your next period is estimated to arrive in about **${daysUntil} days** 📅\n\nYou're currently in your **${currentPhase?.name || 'cycle'}** phase. ${currentPhase?.tips?.[0] || ''}\n\nWant me to share some tips for this phase? 🌸`;
    }
    return `I'd love to help predict your cycle! To give accurate predictions, I need your last period start date. You can log it in the Cycle Calendar section 📅💕`;
  }

  // Cramps & pain
  if (lowerMsg.match(/(cramp|pain|hurt|ache|painful|sore|tender.*abdomen|lower.*belly)/)) {
    return `I'm sorry you're dealing with cramps 💔 Here are some things that might help:\n\n🌡️ **Heat therapy** — A warm heating pad on your lower abdomen works wonders\n🍵 **Ginger tea** — Natural anti-inflammatory that eases pain\n🧘‍♀️ **Gentle stretching** — Try child's pose or cat-cow stretches\n💊 **Magnesium** — Can help relax uterine muscles\n🛁 **Warm bath** — Relaxes muscles and reduces tension\n🍌 **Potassium-rich foods** — Bananas and sweet potatoes help\n\nIf cramps are severe or unusual, please don't hesitate to consult your healthcare provider. You deserve to feel comfortable! 🌸`;
  }

  // Headache & migraine
  if (lowerMsg.match(/(headache|migraine|head.*hurt|head.*pain|head.*ache)/)) {
    return `Hormonal headaches can be really tough 😔 They're often linked to estrogen drops before your period. Here's what may help:\n\n💧 **Hydration** — Drink plenty of water; dehydration worsens headaches\n🧊 **Cold compress** — Apply to forehead or temples for 15 minutes\n☕ **Small amount of caffeine** — Can help constrict blood vessels\n🌿 **Peppermint oil** — Dab on temples for natural relief\n😴 **Rest in a dark room** — Light sensitivity is common\n🍳 **Magnesium-rich foods** — Almonds, spinach, dark chocolate\n💊 **Riboflavin (Vitamin B2)** — Studies show it can prevent menstrual migraines\n\nIf migraines are severe, come with visual changes, or happen frequently, please see your doctor. You matter! 💕`;
  }

  // Skin, acne, breakouts
  if (lowerMsg.match(/(skin|acne|pimple|breakout|break.*out|glow|face|complexion|oily|dry.*skin)/)) {
    return `Hormonal skin changes are SO real — you're not imagining it! 🧴✨\n\nYour skin through the cycle:\n\n🔴 **Menstruation** — Skin may be dry and dull. Focus on hydrating moisturizers and gentle cleansers\n🌱 **Follicular** — Your glow-up phase! Estrogen rises, skin looks radiant. Great time for active treatments\n🌕 **Ovulation** — Peak glow! Skin is at its best. Minimal routine needed\n🌙 **Luteal** — Progesterone spikes → more oil → breakouts. Use salicylic acid, avoid heavy products\n\n**General tips:**\n• Never skip sunscreen (SPF 30+)\n• Don't touch your face\n• Change pillowcases weekly\n• Tea tree oil is a natural spot treatment\n• Zinc supplements can help hormonal acne\n\n${currentPhase ? `You're in the **${currentPhase.name}** phase — adjust your skincare accordingly! ` : ''}🌸`;
  }

  // Mood, emotions, mental health
  if (lowerMsg.match(/(mood|sad|angry|emotional|cry|crying|anxiety|anxious|stressed|irritable|depressed|depression|mental|overwhelm|panic|nervous|worry|worried|upset|lonely|low.*mood)/)) {
    return `Hey, it's completely okay to feel this way 💕 Hormonal changes during your cycle can really affect your emotions, and that's totally valid.\n\nHere are some gentle suggestions:\n\n🌿 **Deep breathing** — Try 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s)\n📝 **Journal** — Write down what you're feeling without judgment\n🚶‍♀️ **Gentle walk** — Even 10 minutes outside can help\n🍫 **Dark chocolate** — Yes, it's actually beneficial (in moderation!)\n🤗 **Reach out** — Talk to someone you trust\n🧘 **Body scan meditation** — Lie down, focus on each body part, breathe\n🎵 **Music therapy** — Create a comfort playlist\n\nRemember: you're not "being dramatic." Your feelings are real and valid. If feelings of sadness persist for weeks, please reach out to a mental health professional. I'm here for you! 🌷`;
  }

  // PMS / PMDD
  if (lowerMsg.match(/(pms|pmdd|premenstrual|pre.*menstrual|before.*period.*feel)/)) {
    return `PMS (Premenstrual Syndrome) affects up to 75% of women — you're definitely not alone! 💕\n\n**Common PMS symptoms (1-2 weeks before period):**\n• Mood swings, irritability, anxiety\n• Bloating, breast tenderness\n• Fatigue, food cravings\n• Headaches, trouble sleeping\n\n**Relief strategies:**\n🥗 Reduce salt, sugar, caffeine, and alcohol\n💊 Calcium (1200mg/day) and Vitamin B6 can help\n🏃‍♀️ Regular exercise — 30 min, 5x/week\n😴 Prioritize 7-9 hours of sleep\n🧘 Stress management techniques\n\n**⚠️ About PMDD:** If symptoms are severe enough to interfere with daily life, relationships, or work, you may have PMDD (Premenstrual Dysphoric Disorder). This is a medical condition that deserves professional care — please talk to your doctor. You deserve help! 🌸`;
  }

  // Bloating
  if (lowerMsg.match(/(bloat|bloating|swollen|water.*retention|puffy|gas|gassy)/)) {
    return `Bloating is so uncomfortable, I hear you! 🫧 Here's what can help:\n\n💧 **Drink more water** — Counterintuitive but it reduces water retention\n🍌 **Potassium-rich foods** — Bananas, avocados, sweet potatoes\n🫖 **Peppermint or fennel tea** — Natural de-bloaters\n🧂 **Reduce sodium** — Cut back on processed foods\n🚶‍♀️ **Light movement** — Gentle walks help gas move through\n🥒 **Cucumber & ginger** — Both are natural anti-bloating foods\n🫘 **Probiotics** — Yogurt, kefir, or supplements support gut health\n\nBloating usually peaks during the luteal phase and early menstruation. You've got this! 💪🌸`;
  }

  // Sleep & fatigue
  if (lowerMsg.match(/(sleep|insomnia|tired|fatigue|exhausted|can't sleep|rest|drowsy|energy|low.*energy|no.*energy)/)) {
    return `Quality sleep is SO important, especially during your cycle 😴💕\n\n🌙 **Tips for better sleep:**\n- Keep your room cool (65-68°F / 18-20°C)\n- Avoid screens 1 hour before bed\n- Try chamomile or valerian root tea\n- Magnesium supplements can help\n- Lavender aromatherapy is calming\n- Stick to a consistent bedtime\n\n**Energy by phase:**\n🔴 **Menstruation** — Energy is low; rest more, it's okay!\n🌱 **Follicular** — Energy is rising; ride the wave!\n🌕 **Ovulation** — Peak energy; make the most of it!\n🌙 **Luteal** — Energy dips; wind down gently\n\nSleep is your superpower. Don't feel guilty about resting! 🌸`;
  }

  // Current phase
  if (lowerMsg.match(/(what.*phase|which.*phase|cycle.*phase|current.*phase|my.*phase)/)) {
    if (currentPhase) {
      return `You're currently in your **${currentPhase.emoji} ${currentPhase.name}** phase (Day ${phaseInfo?.day})!\n\n**Mood:** ${currentPhase.mood}\n\n**Tips for this phase:**\n${currentPhase.tips.map(t => `• ${t}`).join('\n')}\n\n${currentPhase.workTips ? `\n**Work suggestions:**\n${currentPhase.workTips.slice(0, 3).map(t => `• ${t}`).join('\n')}` : ''}\n\nWant to know more about any specific aspect? 💕`;
    }
    return `I'd need your cycle data to determine your current phase. Head over to the Cycle Calendar to log your last period! 📅`;
  }

  // Irregular periods
  if (lowerMsg.match(/(irregular|late.*period|missed.*period|skip.*period|period.*late|period.*early|absent|amenorrhea|no.*period|spotting|spot)/)) {
    return `Irregular periods can be concerning, so I'm glad you're paying attention 💕\n\n**Common causes of irregular periods:**\n• Stress (physical or emotional)\n• Significant weight changes\n• Excessive exercise\n• PCOS (Polycystic Ovary Syndrome)\n• Thyroid issues\n• Starting/stopping birth control\n• Perimenopause\n• Pregnancy\n\n**When to see a doctor:**\n🚨 Periods consistently shorter than 21 days or longer than 35 days\n🚨 Missing 3+ periods in a row\n🚨 Very heavy bleeding (soaking through a pad/tampon every hour)\n🚨 Severe pain that disrupts daily activities\n🚨 Bleeding between periods\n\nTracking your cycle (which you're already doing here! 🎉) is the best way to spot patterns. Share your Cuterus health report with your doctor! 🌸`;
  }

  // Food & nutrition
  if (lowerMsg.match(/(food|eat|diet|nutrition|cravings|hungry|vitamin|mineral|iron|calcium|supplement|what.*eat|what.*drink|drink|tea|coffee|caffeine|water|hydrat)/)) {
    return `Great question about nutrition! 🥗 Here's what your body loves during different phases:\n\n🔴 **Menstruation:** Iron-rich foods (spinach, lentils, red meat), warm soups, ginger tea, dark chocolate\n🌱 **Follicular:** Fresh veggies, fermented foods (kimchi, yogurt), lean protein, flaxseeds\n🌕 **Ovulation:** Raw fruits & veggies, anti-inflammatory foods (turmeric, salmon), fiber-rich grains\n🌙 **Luteal:** Complex carbs (sweet potatoes, quinoa, oats), dark chocolate, magnesium-rich foods (nuts, seeds)\n\n**Key supplements:**\n💊 Iron — especially during menstruation\n💊 Magnesium — for cramps, sleep, and mood\n💊 Vitamin B6 — helps with PMS\n💊 Omega-3 — reduces inflammation\n💊 Calcium — eases cramps and mood swings\n💊 Vitamin D — supports hormonal balance\n\n${currentPhase ? `Since you're in the **${currentPhase.name}** phase, focus on those specific recommendations! ` : ''}🌸`;
  }

  // Exercise & fitness
  if (lowerMsg.match(/(exercise|workout|gym|run|running|yoga|fitness|sport|swimming|dance|walk|cardio|hiit|pilates|stretch|weight.*lift|strength|training)/)) {
    return `Moving your body is wonderful, but the best exercise changes with your cycle! 🏃‍♀️\n\n🔴 **Menstruation:** Gentle yoga, walking, light stretching, restorative poses\n🌱 **Follicular:** Try new workouts! Cardio, HIIT, dance classes, rock climbing\n🌕 **Ovulation:** Peak performance! Running, strength training, group sports, competitions\n🌙 **Luteal (early):** Moderate strength training, swimming, Pilates\n🌙 **Luteal (late):** Slow down — gentle walks, yin yoga, light Pilates\n\n**Best yoga poses for periods:**\n🧘 Child's pose — relieves lower back pain\n🧘 Cat-cow — eases cramps\n🧘 Supine twist — helps bloating\n🧘 Legs up the wall — reduces fatigue\n\n${currentPhase ? `Right now in your **${currentPhase.name}** phase, ${phaseInfo?.phase === 'MENSTRUATION' ? "gentle movement is best. Don't push too hard! 💕" : phaseInfo?.phase === 'OVULATION' ? "your energy is at its peak — perfect for intense workouts! 💪" : "listen to your body and find what feels right! 🌸"}` : 'Match your workout to your phase for best results! 🌸'}`;
  }

  // Work productivity
  if (lowerMsg.match(/(work|productive|focus|meeting|present|schedule|office|career|job|task|deadline|concentrate|concentration)/)) {
    if (currentPhase?.workTips) {
      return `Here are work tips for your **${currentPhase.name}** phase 💼✨\n\n${currentPhase.workTips.map(t => `• ${t}`).join('\n')}\n\nRemember, working WITH your cycle rather than against it can boost your productivity significantly! 📈🌸`;
    }
    return `Cycle-aware productivity is a game changer! 💼 Each phase has different strengths:\n\n🔴 **Menstruation** — Planning, organizing, reviewing, admin tasks\n🌱 **Follicular** — Creative tasks, brainstorming, learning new skills, networking\n🌕 **Ovulation** — Presentations, client meetings, leadership, negotiations\n🌙 **Luteal** — Detail work, editing, debugging, completing projects\n\nWant phase-specific tips? 🌸`;
  }

  // Contraception & birth control
  if (lowerMsg.match(/(contracept|birth.*control|pill|iud|condom|protection|safe.*sex|prevent.*pregn|morning.*after)/)) {
    return `Birth control is a personal choice, and knowing your options is empowering! 💊💕\n\n**Common methods:**\n• 💊 **Hormonal pills** — 91-99% effective; may regulate periods\n• 🔄 **IUD** — 99%+ effective; hormonal or copper options\n• 💉 **Injection** — 94-99% effective; every 3 months\n• 🩹 **Patch/Ring** — 91-99% effective; weekly/monthly\n• 🔒 **Condoms** — 85-98% effective; also protect against STIs\n• 📱 **Fertility awareness** — Track your cycle to identify fertile windows\n\n**Important notes:**\n• Hormonal methods can affect your cycle and symptoms\n• It may take a few months for your body to adjust\n• No method is 100% — discuss with your doctor what's right for you\n\nI'd recommend talking to your healthcare provider to find the best fit for your body and lifestyle! 🌸`;
  }

  // Fertility & pregnancy
  if (lowerMsg.match(/(fertil|pregnan|conceiv|ovulat|baby|trying.*conceive|ttc|fertile.*window|egg|sperm)/)) {
    return `Understanding your fertile window is key! 🌟\n\n**Your fertility by phase:**\n🔴 **Menstruation** — Very low fertility\n🌱 **Follicular** — Rising fertility as you approach ovulation\n🌕 **Ovulation (Day ~14)** — PEAK fertility! The egg lives 12-24 hours\n🌙 **Luteal** — Low fertility after ovulation\n\n**Fertile window:** Typically 5 days before ovulation + ovulation day itself (sperm can survive up to 5 days!)\n\n**Signs of ovulation:**\n• Clear, stretchy cervical mucus (like egg whites)\n• Slight rise in basal body temperature\n• Mild pelvic pain (mittelschmerz)\n• Increased libido\n• Breast tenderness\n\n${phaseInfo?.phase === 'OVULATION' ? '⚡ You may be in your fertile window right now!' : ''}\n\nFor trying to conceive or avoiding pregnancy, consider talking to your doctor for personalized guidance! 💕`;
  }

  // Libido & intimacy
  if (lowerMsg.match(/(libido|sex|intimacy|intimate|desire|arousal|sex.*drive|horny|turn.*on|attracted)/)) {
    return `Libido changes throughout your cycle are completely normal! 💕\n\n**Your desire by phase:**\n🔴 **Menstruation** — Can vary; some feel increased desire, others less. Period sex is safe!\n🌱 **Follicular** — Gradually increasing as estrogen rises\n🌕 **Ovulation** — Typically HIGHEST libido! Estrogen and testosterone peak\n🌙 **Luteal** — Usually decreases as progesterone dominates\n\n**Tips:**\n• Communicate openly with your partner about how you're feeling\n• Low libido phases are normal — don't pressure yourself\n• Self-care and stress reduction can help\n• If low libido is persistent, it could be related to birth control or other factors\n\nYour body, your pace. Always! 🌸`;
  }

  // Hygiene & period products
  if (lowerMsg.match(/(hygien|pad|tampon|cup|menstrual.*cup|period.*product|clean|wash|smell|odor|discharge|flow|heavy.*flow|light.*flow|cloth.*pad|reusabl)/)) {
    return `Great question about menstrual hygiene! 🧼✨\n\n**Period products:**\n🩹 **Disposable pads** — Easy to use, various absorbencies\n🔵 **Tampons** — Internal, change every 4-8 hours (⚠️ don't exceed 8h — TSS risk)\n🥤 **Menstrual cups** — Reusable, eco-friendly, up to 12 hours\n🩲 **Period underwear** — Comfortable, reusable, great for light days\n♻️ **Reusable cloth pads** — Eco-friendly, gentle on skin\n💿 **Menstrual discs** — Similar to cups, some allow mess-free intimacy\n\n**Hygiene tips:**\n• Change products regularly\n• Wash with warm water (avoid scented soaps internally)\n• Wear breathable cotton underwear\n• Light discharge between periods is normal!\n• Slight odor is normal; strong odor may need medical attention\n\nChoose what feels most comfortable for YOUR body! 🌸`;
  }

  // Weight changes
  if (lowerMsg.match(/(weight|gain|lose|fat|thin|heavy|scale|body.*image|body.*weight|retain)/)) {
    return `Weight fluctuations during your cycle are completely normal! ⚖️💕\n\n**What happens:**\n🔴 **Menstruation** — Water weight starts dropping\n🌱 **Follicular** — You may feel lighter; metabolism is efficient\n🌕 **Ovulation** — Some water retention possible\n🌙 **Luteal** — Most weight gain (1-5 lbs is normal!) due to water retention, progesterone, and increased appetite\n\n**Tips:**\n• Don't weigh yourself during the luteal phase — it's misleading!\n• Cravings are hormonal — honor them in moderation\n• Stay hydrated to reduce water retention\n• Focus on how you FEEL, not the number\n• Regular exercise helps regulate weight naturally\n\nYour body is doing amazing things. Be kind to it! 🌸`;
  }

  // Breast tenderness
  if (lowerMsg.match(/(breast|boob|chest.*pain|nipple|tender.*breast|sore.*breast|breast.*swell|breast.*hurt)/)) {
    return `Breast tenderness is very common and usually hormonal! 💕\n\n**Why it happens:** Rising progesterone in the luteal phase causes fluid retention in breast tissue.\n\n**Relief tips:**\n👙 **Supportive bra** — A well-fitting sports bra can help a lot\n🧊 **Cold compress** — Reduces swelling and pain\n☕ **Reduce caffeine** — It can worsen breast pain\n💊 **Evening primrose oil** — Some studies show it helps\n🥗 **Low-salt diet** — Reduces water retention\n🌿 **Flaxseed** — Contains lignans that may help balance hormones\n\n**When to see a doctor:**\n🚨 A new lump that doesn't go away after your period\n🚨 Discharge from nipples\n🚨 Pain in only one breast that persists\n🚨 Skin changes on the breast\n\nMost cyclical breast pain is harmless, but trust your instincts! 🌸`;
  }

  // Back pain
  if (lowerMsg.match(/(back.*pain|backache|lower.*back|spine|back.*hurt|back.*ache)/)) {
    return `Lower back pain during your period is super common — prostaglandins (the same chemicals causing cramps) can affect your back muscles too 😔\n\n**Relief tips:**\n🌡️ **Heat pad on lower back** — 20 minutes on, 20 minutes off\n🧘 **Child's pose** — Amazing for lower back relief\n🧘 **Cat-cow stretches** — Gently mobilizes the spine\n🛁 **Warm bath with Epsom salt** — Magnesium absorbs through skin\n💆 **Gentle massage** — Use circular motions on the lower back\n🛏️ **Sleep position** — Try sleeping on your side with a pillow between your knees\n💊 **Anti-inflammatory foods** — Turmeric, ginger, omega-3 fatty acids\n\nIf back pain is severe or constant throughout your cycle, please see your doctor! 🌸`;
  }

  // Nausea
  if (lowerMsg.match(/(nausea|nauseous|vomit|throw.*up|sick.*stomach|queasy|stomach.*upset|tummy)/)) {
    return `Period nausea is more common than people realize! It's caused by prostaglandins affecting your digestive system 🤢\n\n**Quick relief:**\n🫖 **Ginger tea or ginger candies** — Nature's #1 anti-nausea remedy\n🍋 **Lemon water** — Sip slowly\n🫗 **Small, frequent meals** — Don't eat large portions\n🍞 **Plain crackers or toast** — Easy on the stomach\n🌿 **Peppermint** — Tea or aromatherapy\n💨 **Fresh air** — Step outside for a few minutes\n❌ **Avoid** — Spicy, greasy, or very sweet foods\n\n**When to worry:**\n🚨 Can't keep any food/water down for 24+ hours\n🚨 Nausea happens every cycle and is severe\n🚨 Accompanied by fever\n\nTake it slow, lovely. Your body is doing a lot right now! 💕`;
  }

  // Digestive issues
  if (lowerMsg.match(/(diarrhea|constipat|digest|bowel|poop|stomach|ibs|gut|intestin|fiber)/)) {
    return `Period poops are REAL and you're not alone! 😅💕 Prostaglandins don't just affect your uterus — they impact your entire digestive system.\n\n**What happens:**\n🔴 **During period** — Prostaglandins can cause diarrhea, loose stools\n🌙 **Before period (luteal)** — Progesterone slows digestion → constipation, bloating\n\n**Tips for digestive comfort:**\n💧 Stay well hydrated\n🥬 Eat fiber-rich foods (but introduce slowly!)\n🫖 Peppermint tea for bloating\n🥣 Probiotics (yogurt, kefir, kimchi)\n🚶 Light movement helps digestion\n🍌 Bananas — great for both diarrhea and constipation\n❌ Reduce dairy if lactose-sensitive during your period\n\nYour gut and your hormones are deeply connected! 🌸`;
  }

  // PCOS
  if (lowerMsg.match(/(pcos|polycystic|ovarian.*cyst|cyst.*ovary|androgen|testosterone.*high|hirsutism|hair.*grow)/)) {
    return `PCOS (Polycystic Ovary Syndrome) affects 1 in 10 women — you're not alone! 💕\n\n**Common symptoms:**\n• Irregular or missed periods\n• Excess hair growth (face, body)\n• Acne, oily skin\n• Weight gain (especially around midsection)\n• Thinning hair on head\n• Difficulty getting pregnant\n• Darkened skin patches\n\n**Management strategies:**\n🥗 **Anti-inflammatory diet** — Reduce sugar, processed foods\n🏃‍♀️ **Regular exercise** — Helps insulin resistance\n😴 **Quality sleep** — Crucial for hormone balance\n💊 **Supplements** — Inositol, Vitamin D, omega-3 (ask your doctor)\n🧘 **Stress management** — Cortisol worsens PCOS\n\n**⚠️ Important:** PCOS is a medical condition that benefits greatly from professional care. Please work with your doctor for proper diagnosis and treatment! 🌸`;
  }

  // Endometriosis
  if (lowerMsg.match(/(endometri|endo|painful.*period.*extreme|excruciating|debilitating.*pain|tissue.*grow)/)) {
    return `Endometriosis is a serious condition where tissue similar to the uterine lining grows outside the uterus 💕\n\n**Common symptoms:**\n• Severe menstrual cramps (beyond "normal")\n• Pain during or after sex\n• Pain with bowel movements or urination (during period)\n• Heavy periods\n• Fatigue\n• Difficulty getting pregnant\n• Chronic pelvic pain\n\n**What helps:**\n🌡️ Heat therapy for pain relief\n🧘 Gentle yoga and stretching\n🥗 Anti-inflammatory diet\n💊 Pain management (talk to your doctor)\n📝 Track your symptoms — this helps diagnosis!\n\n**⚠️ Critical:** Endometriosis takes an average of **7-10 years** to diagnose. If you suspect it, advocate for yourself with your doctor! You deserve to be heard and treated. Your pain is valid! 🌸`;
  }

  // Menopause & perimenopause
  if (lowerMsg.match(/(menopaus|perimenopaus|hot.*flash|night.*sweat|age.*period|stop.*period|end.*period)/)) {
    return `Perimenopause and menopause are natural transitions 🌿💕\n\n**Timeline:**\n• **Perimenopause** — Usually starts in mid-40s (can be late 30s); lasts 4-8 years\n• **Menopause** — Official after 12 consecutive months without a period (avg age 51)\n\n**Common symptoms:**\n🌡️ Hot flashes and night sweats\n😴 Sleep disturbances\n😢 Mood changes\n🦴 Bone density changes\n💇 Hair and skin changes\n📉 Irregular periods (heavier, lighter, or skipped)\n\n**Management:**\n• Regular exercise (especially weight-bearing)\n• Calcium + Vitamin D for bone health\n• Cooling techniques for hot flashes\n• Hormone therapy (discuss with your doctor)\n• Mindfulness and stress reduction\n\nThis is a natural phase of life — you've got this! 🌸`;
  }

  // Doctor & medical
  if (lowerMsg.match(/(doctor|gynecolog|medical|hospital|appointment|check.*up|exam|test|diagnos|when.*see|should.*see)/)) {
    return `Knowing when to see a doctor is so important! 👩‍⚕️💕\n\n**See a doctor if you experience:**\n🚨 Periods shorter than 21 days or longer than 35 days\n🚨 Bleeding that lasts more than 7 days\n🚨 Soaking through a pad/tampon every 1-2 hours\n🚨 Severe pain that doesn't respond to OTC pain relief\n🚨 Missed 3+ periods (and not pregnant)\n🚨 Bleeding between periods or after sex\n🚨 Unusual discharge with strong odor\n🚨 Sudden changes in your cycle pattern\n\n**For your appointment:**\n📋 Bring your Cuterus health report (download it from Health Report page!)\n📝 Note your cycle dates, symptoms, and severity\n❓ Write down your questions beforehand\n💪 Don't minimize your symptoms — be honest\n\nYour health matters, and you deserve great care! 🌸`;
  }

  // Meditation, mindfulness, self-care
  if (lowerMsg.match(/(meditat|mindful|relax|self.*care|self.*love|calm|peace|breath|breathing|zen|wellness|pamper|spa|bath|journal)/)) {
    return `Self-care is not selfish — it's essential! 🧘‍♀️💕\n\n**Phase-specific self-care:**\n🔴 **Menstruation** — Rest, warm baths, comfort movies, journaling, say no to extras\n🌱 **Follicular** — Try something new! Social time, creative hobbies, nature walks\n🌕 **Ovulation** — Date night, social gatherings, dancing, celebrating yourself\n🌙 **Luteal** — Cozy evenings, gentle yoga, face masks, decluttering, early bedtimes\n\n**Quick mindfulness exercises:**\n🌿 **5-4-3-2-1 Grounding** — Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste\n🫁 **Box breathing** — Inhale 4s, hold 4s, exhale 4s, hold 4s\n🧘 **Body scan** — Lie down, mentally scan from toes to head\n📝 **Gratitude journaling** — Write 3 things you're grateful for\n\nYou deserve to feel good. Always. 🌸`;
  }

  // Relationships & communication
  if (lowerMsg.match(/(relationship|partner|boyfriend|girlfriend|husband|wife|spouse|communicate|tell.*partner|explain.*partner|support|family|friend)/)) {
    return `Talking about your cycle with loved ones can strengthen your relationships! 💕\n\n**Tips for communicating:**\n💬 **Be direct** — "I'm in my luteal phase and may feel more sensitive this week"\n📱 **Share your calendar** — Let your partner know your cycle phases\n❤️ **Express needs clearly** — "I need extra rest" or "A hug would help"\n🚫 **Set boundaries** — It's okay to need alone time\n📚 **Educate together** — Share articles or this app with them!\n\n**How partners can help:**\n• Be patient during PMS/menstruation\n• Offer practical support (tea, heating pad, chocolate!)\n• Don't dismiss feelings as "just hormones"\n• Ask "How can I support you?" instead of trying to fix\n• Celebrate the high-energy phases together!\n\nHealthy communication about cycles normalizes something that's completely natural! 🌸`;
  }

  // Thank you / goodbye
  if (lowerMsg.match(/(thank|thanks|thx|grateful|appreciate|bye|goodbye|see you|talk later|gotta go|good.*night|night)/)) {
    const responses = [
      `You're so welcome! 💕🌸 I'm always here for you. Remember, understanding your body is a superpower! Take care of yourself, ${userName}. ✨`,
      `Anytime, lovely! 🌷 Don't hesitate to come back whenever you need support. Your wellness journey matters to me! 💕`,
      `Take care, ${userName}! 💕 Remember — you're doing amazing. See you next time! 🌸✨`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Yes / No / Okay
  if (lowerMsg.match(/^(yes|yeah|yep|sure|ok|okay|yea|ya|alright|absolutely|definitely|please|go ahead|tell me)$/)) {
    return `Great! 💕 What would you like to know more about? I can help with:\n\n• 🩸 Your cycle & predictions\n• 😣 Any symptoms you're experiencing\n• 🥗 Nutrition advice for your current phase\n• 🏃‍♀️ Exercise recommendations\n• 💼 Work productivity tips\n• 🧘 Self-care & meditation\n• 💊 Health conditions (PCOS, endo, etc.)\n\nJust ask! I'm all ears 🌸`;
  }

  // No / negative
  if (lowerMsg.match(/^(no|nope|nah|not really|nothing|never mind|nevermind|nm|i'm good|im good|all good)$/)) {
    return `No worries at all! 😊 I'm here whenever you need me. Just say hi and I'll be ready to help! Take care, ${userName} 💕🌸`;
  }

  // Love / compliments
  if (lowerMsg.match(/(love you|you're great|you're amazing|you're awesome|best bot|love this|so helpful|cute|adorable|sweet)/)) {
    return `Aww, you just made my day! 🥰💕 I love being here for you! Your health and happiness mean everything. Keep being the amazing person you are, ${userName}! 🌸✨`;
  }

  // Smart fallback - try to give a relevant response based on ANY health keyword
  const healthKeywords = {
    'hormone': 'hormones', 'estrogen': 'hormones', 'progesterone': 'hormones', 'testosterone': 'hormones',
    'uterus': 'reproductive health', 'ovary': 'reproductive health', 'cervix': 'reproductive health', 'vagina': 'reproductive health',
    'infection': 'health concern', 'uti': 'health concern', 'yeast': 'health concern', 'itch': 'health concern', 'burn': 'health concern',
    'medicine': 'medication', 'drug': 'medication', 'ibuprofen': 'medication', 'painkiller': 'medication', 'naproxen': 'medication',
    'hot': 'body temperature', 'cold': 'body temperature', 'temperature': 'body temperature', 'fever': 'body temperature',
    'blood': 'menstrual flow', 'clot': 'menstrual flow', 'heavy': 'menstrual flow', 'light': 'menstrual flow', 'flow': 'menstrual flow',
    'natural': 'natural remedies', 'herb': 'natural remedies', 'remedy': 'natural remedies', 'homeopat': 'natural remedies', 'ayurved': 'natural remedies',
  };

  for (const [keyword, topic] of Object.entries(healthKeywords)) {
    if (lowerMsg.includes(keyword)) {
      const topicResponses = {
        'hormones': `Great question about hormones! 🧬💕 Your cycle is orchestrated by a beautiful dance of hormones:\n\n🔴 **Menstruation** — Estrogen and progesterone are at their lowest\n🌱 **Follicular** — Estrogen rises steadily, boosting mood and energy\n🌕 **Ovulation** — Estrogen peaks + LH surge triggers egg release\n🌙 **Luteal** — Progesterone dominates; estrogen drops before period\n\nHormonal imbalances can cause irregular periods, acne, mood issues, and more. If you suspect an imbalance, your doctor can check with a simple blood test! 🌸`,
        'reproductive health': `That's an important topic! 💕 Your reproductive system is incredible. Here's a quick overview:\n\n🌸 **Ovaries** — Release eggs and produce hormones\n🌸 **Uterus** — Where the endometrial lining builds and sheds (your period!)\n🌸 **Cervix** — Changes throughout your cycle (position, mucus texture)\n🌸 **Fallopian tubes** — Where fertilization occurs\n\nRegular check-ups, Pap smears, and paying attention to changes in your body are all important! 👩‍⚕️🌸`,
        'health concern': `That sounds like it could need medical attention 💕 Some symptoms like unusual discharge, itching, burning during urination, or signs of infection should be evaluated by a healthcare provider.\n\n👩‍⚕️ Please don't self-diagnose — see your doctor! UTIs, yeast infections, and other conditions are very common and very treatable. There's no shame in getting help!\n\nIn the meantime: stay hydrated, wear cotton underwear, and avoid scented products in sensitive areas. 🌸`,
        'medication': `When it comes to medication during your cycle 💊💕:\n\n**For cramps:** Ibuprofen or naproxen work best if taken BEFORE pain gets severe\n**For headaches:** Acetaminophen or ibuprofen\n**For mood:** Talk to your doctor about options\n\n⚠️ Always follow dosage instructions and consult your healthcare provider before starting new medications or supplements. I'm not a substitute for medical advice! 🌸`,
        'body temperature': `Your body temperature naturally fluctuates during your cycle! 🌡️\n\n📉 **Before ovulation** — Slightly lower basal body temperature\n📈 **After ovulation** — Rises 0.3-0.5°F due to progesterone\n🩸 **Period** — Drops back down\n\nTracking your basal body temperature (BBT) can help predict ovulation! Take it first thing in the morning before getting out of bed for accurate readings. 🌸`,
        'menstrual flow': `Understanding your flow is important! 🩸💕\n\n**Normal ranges:**\n• Period lasts 3-7 days\n• Total blood loss: 30-80ml per cycle\n• Color: bright red → dark red → brown (all normal!)\n• Small clots (smaller than a quarter) are normal\n\n**See a doctor if:**\n🚨 Soaking through a pad/tampon every 1-2 hours\n🚨 Clots larger than a quarter\n🚨 Period lasts more than 7 days\n🚨 Periods suddenly become much heavier or lighter\n\nEvery body is different — know YOUR normal! 🌸`,
        'natural remedies': `I love natural approaches! 🌿💕 Here are evidence-backed natural remedies:\n\n🍵 **Ginger** — Cramps, nausea\n🌿 **Chamomile** — Sleep, anxiety, mild cramps\n🫖 **Peppermint** — Bloating, headaches\n🌸 **Raspberry leaf tea** — May tone uterine muscles\n🧈 **Evening primrose oil** — Breast tenderness, PMS\n🌰 **Flaxseed** — Hormonal balance\n🍫 **Dark chocolate** — Mood, magnesium\n🫚 **Turmeric** — Anti-inflammatory\n🌿 **Ashwagandha** — Stress and cortisol\n\n⚠️ Natural doesn't always mean safe — check with your doctor before starting supplements, especially if you take medications! 🌸`,
      };
      return topicResponses[topic] || topicResponses['hormones'];
    }
  }

  // Ultimate fallback - empathetic and helpful
  return `That's a thoughtful question, ${userName}! 🌸 I want to give you the best answer I can. Here are some of the many topics I'm knowledgeable about:\n\n• 🩸 **Periods & Cycle** — Predictions, irregular periods, flow changes\n• 😣 **Symptoms** — Cramps, headaches, bloating, nausea, back pain\n• 😢 **Mental Health** — Mood swings, anxiety, PMS, PMDD\n• 🧴 **Skin & Body** — Acne, weight, breast tenderness\n• 🥗 **Nutrition** — Phase-specific diets, supplements, cravings\n• 🏃‍♀️ **Exercise** — Cycle-aware workouts, yoga\n• 💊 **Conditions** — PCOS, endometriosis, menopause\n• 🔒 **Contraception & Fertility** — Birth control, fertile windows\n• 🧼 **Hygiene** — Products, care tips\n• 💼 **Work** — Productivity by phase\n• 🧘 **Self-Care** — Meditation, relaxation\n• 💕 **Relationships** — Communication tips\n• 👩‍⚕️ **When to see a doctor**\n\nTry asking me about any of these, or describe what you're feeling and I'll do my best to help! 💕`;
}

export default function ChatPage() {
  const { user, chatMessages, addChatMessage } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;
  const isAIConnected = true; // Always attempt to use backend

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const saveApiKey = () => {
    setShowSettings(false);
  };

  // Welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 🌸 I'm **Utaura**, your personal wellness companion.\n\nI'm here to help you understand your body better, manage symptoms, and feel your best throughout your cycle. ${phaseInfo ? `You're currently in your **${currentPhase.name}** phase.` : ''}\n\nFeel free to ask me anything about:\n• 🩸 Your cycle & predictions\n• 😣 Symptom management\n• 🥗 Nutrition & exercise tips\n• 💕 Emotional support\n\nHow can I help you today? ✨`,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const getResponse = async (messageText, allMessages) => {
    try {
      return await callOpenAI(allMessages, phaseInfo, user);
    } catch (err) {
      console.error('API error, falling back to local:', err);
      const localResponse = generateResponse(messageText, phaseInfo, user);
      return localResponse + `\n\n⚠️ *Backend unavailable - using local AI*`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    const msgText = input;
    setInput('');
    setIsTyping(true);

    const allMessages = [...chatMessages, userMessage];
    const response = await getResponse(msgText, allMessages);
    addChatMessage({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '🩸 Next period?', message: 'When is my next period?' },
    { label: '😣 Help with cramps', message: 'I have bad cramps, what should I do?' },
    { label: '🌀 Current phase', message: 'What phase am I in right now?' },
    { label: '🥗 Food tips', message: 'What should I eat during my current phase?' },
    { label: '💼 Work advice', message: 'How should I plan my work this week based on my cycle?' },
    { label: '😴 Sleep help', message: 'I\'m having trouble sleeping' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ 
            boxShadow: ['0 0 0px rgba(236,72,153,0.3)', '0 0 20px rgba(236,72,153,0.3)', '0 0 0px rgba(236,72,153,0.3)'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center"
        >
          <Flower2 className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-xl font-display font-bold text-gray-800 flex items-center gap-2">
            Utaura
            <Sparkles className="w-4 h-4 text-pink-400" />
          </h1>
          <p className="text-xs text-gray-500">
            {isAIConnected ? '🟢 Connected to ChatGPT' : 'Built-in AI'} • Warm • Empathetic • Always here
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`relative z-50 cursor-pointer ml-auto p-2 rounded-xl transition-all duration-300 ${isAIConnected ? 'bg-green-50 text-green-500 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-500'}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-100/60">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  AI Settings
                </p>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-3">✅ <strong>AI is now enabled!</strong> Your API key is securely stored on the backend. No need to add it here. Just start chatting!</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                🟢 Connected — Utaura is powered by ChatGPT!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white/30 backdrop-blur-sm border border-pink-100/50 p-4 space-y-4 mb-4">
        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-pink-300 to-purple-300' 
                : 'bg-gradient-to-br from-pink-400 to-purple-500'
            }`}>
              {msg.role === 'user' 
                ? <User className="w-4 h-4 text-white" />
                : <Flower2 className="w-4 h-4 text-white" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-tr-sm'
                : 'bg-white/70 border border-pink-100/60 text-gray-700 rounded-tl-sm shadow-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content.split('**').map((part, j) => 
                  j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                )}
              </div>
              <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Flower2 className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/70 border border-pink-100/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="typing-indicator flex gap-1">
                <span></span><span></span><span></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions (only show when no messages from user) */}
        {chatMessages.filter(m => m.role === 'user').length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <p className="text-xs text-gray-400 mb-3 text-center">Quick questions you can ask:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const userMessage = {
                      role: 'user',
                      content: action.message,
                      timestamp: new Date().toISOString(),
                    };
                    addChatMessage(userMessage);
                    setIsTyping(true);
                    const allMessages = [...chatMessages, userMessage];
                    const response = await getResponse(action.message, allMessages);
                    addChatMessage({
                      role: 'assistant',
                      content: response,
                      timestamp: new Date().toISOString(),
                    });
                    setIsTyping(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/60 border border-pink-100 text-sm text-gray-600 hover:bg-pink-50 hover:border-pink-200 transition-all duration-200"
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Utaura anything about your health..."
            rows={1}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-pink-200/60 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none text-sm"
            style={{ maxHeight: '120px' }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            input.trim() && !isTyping
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/40 hover:shadow-xl'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
