export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const direction: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};

/**
 * Every claim below is true of the system that exists. There are no customers,
 * no usage numbers and no prices yet, so none appear — see PRODUCT.md.
 */
const dictionaries = {
  fa: {
    meta: {
      title: "اسمارت‌لایف — دستگاهی که آماده از راه می‌رسد",
      description:
        "دستگاه هوشمند بخرید، به برق بزنید، از پنل آنلاین کنترلش کنید. وای‌فای خانه‌تان را موقع خرید وارد می‌کنید و ما همان را داخل دستگاه می‌گذاریم.",
    },
    brand: "اسمارت‌لایف",
    nav: {
      products: "محصولات",
      how: "چطور کار می‌کند",
      login: "ورود",
      signup: "ساخت حساب",
      menu: "منو",
      close: "بستن",
    },
    hero: {
      title: "با وای‌فای خانه‌ی شما از راه می‌رسد",
      lead: "شبکه‌ی خانه‌تان را یک بار موقع خرید وارد می‌کنید. ما همان را داخل دستگاه می‌گذاریم. شما فقط دوشاخه را می‌زنید.",
      cta: "شروع کنید",
      secondary: "ببینید چطور کار می‌کند",
      scroll: "برای ساخته‌شدن اسکرول کنید",
    },
    devices: {
      title: "سه دستگاه برای شروع",
      lead: "هرکدام با کلید مخصوص خودش ساخته می‌شود و مستقیم به پنل شما وصل می‌شود.",
      thermometer: {
        name: "دماسنج",
        line: "دما و رطوبت را پیوسته گزارش می‌دهد.",
        detail: "عددش را همان لحظه‌ای می‌بینید که اندازه گرفته، نه چند دقیقه بعد.",
      },
      lamp: {
        name: "لامپ",
        line: "روشن، خاموش، شدت نور و رنگ آن.",
        detail: "فرمان را می‌فرستید و دستگاه نتیجه را برمی‌گرداند تا مطمئن شوید انجام شد.",
      },
      camera: {
        name: "دوربین",
        line: "چشمی برای اتاقی که آنجا نیستید.",
        detail: "مثل بقیه، بدون تنظیمات اولیه و با همان پنل.",
      },
    },
    how: {
      title: "سه قدم، و یکی‌اش دست شماست",
      steps: [
        {
          title: "دستگاه را انتخاب می‌کنید",
          body: "همان‌جا نام و رمز وای‌فای خانه‌تان را وارد می‌کنید و سفارش را ثبت می‌کنید.",
        },
        {
          title: "ما می‌سازیمش",
          body: "شبکه‌ی شما و یک کلید مخصوص همان دستگاه، پیش از ارسال داخلش قرار می‌گیرد.",
        },
        {
          title: "به برق می‌زنید",
          body: "خودش وای‌فای را پیدا می‌کند، به سرور وصل می‌شود و در پنل شما ظاهر می‌شود. تمام.",
        },
      ],
      note: "اگر برق برود، وقتی برگشت دستگاه خودش دوباره وصل می‌شود. کاری لازم نیست بکنید.",
    },
    products: {
      title: "برای خرید وارد شوید",
      lead: "برای ثبت سفارش به یک حساب نیاز دارید تا دستگاه به نام شما ساخته شود.",
      cta: "انتخاب و ثبت سفارش",
      hint: "برای دیدن بقیه بکشید",
      prev: "محصول قبلی",
      next: "محصول بعدی",
      // True of all three, so it is said once for the whole rail instead of
      // being repeated on every card.
      common: "هر سه: بدون تنظیمات، وای‌فای خانه‌تان از پیش داخل دستگاه.",
      labels: {
        panel: "در پنل",
        behaviour: "رفتارش",
      },
      cards: {
        thermometer: {
          panel: "عدد زنده‌ی دما و رطوبت",
          behaviour: "خودش پیوسته می‌فرستد",
        },
        lamp: {
          panel: "کلید، شدت نور و رنگ",
          behaviour: "فرمان می‌گیرد و نتیجه را برمی‌گرداند",
        },
        camera: {
          panel: "تصویر همان اتاق",
          behaviour: "با درخواست شما کار می‌کند",
        },
      },
    },
    trust: {
      title: "چیزی که پشت این سادگی است",
      items: [
        {
          title: "هر دستگاه کلید خودش را دارد",
          body: "دستگاه هر بار که وصل می‌شود هویتش را با امضای رمزنگاری‌شده ثابت می‌کند. بدون آن، اتصال برقرار نمی‌شود.",
        },
        {
          title: "فقط شما فرمان می‌دهید",
          body: "هر فرمان جداگانه امضا می‌شود و سرور بررسی می‌کند دستگاه به نام چه کسی ثبت شده است.",
        },
        {
          title: "داده‌ها انبار نمی‌شوند",
          body: "چیزی که دستگاه می‌فرستد زنده به صفحه‌ی شما می‌رسد و ذخیره نمی‌شود. فقط سابقه‌ی فرمان‌ها نگه داشته می‌شود.",
        },
        {
          title: "می‌فهمید کِی قطع شده",
          body: "هر دستگاه مرتب علامت زنده‌بودن می‌فرستد. اگر ساکت شود، پنل بلافاصله آفلاین نشانش می‌دهد.",
        },
      ],
    },
    closing: {
      title: "یک حساب بسازید و اولین دستگاهتان را سفارش دهید",
      lead: "ساخت حساب با ایمیل گوگل انجام می‌شود و چند ثانیه طول می‌کشد.",
      cta: "ساخت حساب",
      login: "قبلاً حساب دارم",
    },
    footer: {
      tagline: "دستگاه هوشمند، بدون مرحله‌ی راه‌اندازی.",
      product: "محصول",
      account: "حساب",
      language: "زبان",
      rights: "تمام حقوق محفوظ است.",
    },
    auth: {
      backHome: "بازگشت به صفحه‌ی اصلی",
      email: "ایمیل",
      emailHint: "فقط آدرس Gmail پذیرفته می‌شود",
      password: "رمز عبور",
      passwordHint: "دست‌کم ۸ نویسه",
      passwordConfirm: "تکرار رمز عبور",
      fullName: "نام و نام خانوادگی",
      optional: "اختیاری",
      code: "کد ۶ رقمی",
      newPassword: "رمز عبور جدید",
      show: "نمایش رمز",
      hide: "پنهان کردن رمز",
      offline: "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.",
      login: {
        title: "ورود به حساب",
        lead: "برای دیدن و کنترل دستگاه‌هایتان وارد شوید.",
        submit: "ورود",
        forgot: "رمزم را فراموش کرده‌ام",
        noAccount: "حساب ندارید؟",
        signupLink: "ساخت حساب",
        unverified: "این ایمیل هنوز تأیید نشده است.",
        goVerify: "تأیید ایمیل",
      },
      signup: {
        title: "ساخت حساب",
        lead: "با یک آدرس Gmail حساب بسازید تا دستگاه به نام شما ثبت شود.",
        submit: "ساخت حساب",
        haveAccount: "حساب دارید؟",
        loginLink: "ورود",
        mismatch: "دو رمز یکسان نیستند.",
      },
      verify: {
        title: "ایمیلتان را تأیید کنید",
        lead: "کد ۶ رقمی را که برایتان فرستادیم وارد کنید.",
        sentTo: "کد به {email} فرستاده شد.",
        submit: "تأیید",
        resend: "ارسال دوباره‌ی کد",
        resent: "اگر این آدرس حسابی داشته باشد، کد تازه فرستاده شد.",
        wait: "{seconds} ثانیه تا ارسال دوباره",
        success: "ایمیل تأیید شد. حالا وارد شوید.",
      },
      forgot: {
        title: "بازیابی رمز عبور",
        lead: "ایمیلتان را بنویسید تا کد بازیابی بفرستیم.",
        submit: "ارسال کد",
        sent: "اگر این آدرس حسابی داشته باشد، کد بازیابی فرستاده شد.",
        backToLogin: "بازگشت به ورود",
      },
      reset: {
        title: "رمز عبور تازه",
        lead: "کدی که برایتان آمد و رمز جدید را وارد کنید.",
        submit: "تغییر رمز",
        success: "رمز عبور عوض شد. حالا وارد شوید.",
      },
    },
    panel: {
      title: "دستگاه‌های من",
      nav: { devices: "دستگاه‌ها", account: "حساب", logout: "خروج" },
      connection: {
        connecting: "در حال اتصال…",
        live: "متصل",
        reconnecting: "قطع شد، در حال اتصال دوباره…",
        failed: "ارتباط زنده برقرار نشد",
        retry: "تلاش دوباره",
      },
      online: "آنلاین",
      offline: "آفلاین",
      unknown: "وضعیت نامشخص",
      lastSeen: "آخرین بار: {when}",
      never: "هرگز متصل نشده",
      refresh: "به‌روزرسانی",
      refreshing: "در حال به‌روزرسانی…",
      empty: {
        title: "هنوز دستگاهی ندارید",
        body: "پس از خرید و رسیدن دستگاه، همین‌جا ظاهر می‌شود.",
        cta: "دیدن محصولات",
      },
      loading: "در حال بارگذاری دستگاه‌ها…",
      loadFailed: "دستگاه‌ها بارگذاری نشدند.",
      device: {
        readings: "داده‌های زنده",
        controls: "کنترل",
        noReadings: "هنوز داده‌ای نرسیده است.",
        noReadingsOffline: "دستگاه آفلاین است.",
        waiting: "منتظر پاسخ دستگاه…",
        offlineNotice: "تا وقتی دستگاه آفلاین است نمی‌توان فرمان فرستاد.",
        sent: "فرمان فرستاده شد",
        done: "انجام شد",
        failed: "انجام نشد",
        timeout: "دستگاه پاسخ نداد",
        history: "فرمان‌های اخیر",
        noHistory: "هنوز فرمانی فرستاده نشده.",
        back: "همه‌ی دستگاه‌ها",
        on: "روشن",
        off: "خاموش",
      },
      // The backend labels its capabilities in English only. Rather than add a
      // translation column to every device type, the panel looks the key up
      // here and falls back to whatever the server sent, so a device type
      // added later still renders — just untranslated until it lands here.
      capabilities: {
        "command.power": "روشن/خاموش",
        "telemetry.power": "وضعیت",
        "command.brightness": "شدت نور",
        "command.color": "رنگ نور",
        "telemetry.temperature": "دما",
        "telemetry.humidity": "رطوبت",
        "command.recording": "ضبط",
        "telemetry.recording": "وضعیت ضبط",
        "command.motion_alerts": "هشدار حرکت",
        "telemetry.motion": "حرکت",
      } as Record<string, string>,
      choices: {
        warm: "گرم",
        neutral: "خنثی",
        cool: "سرد",
      } as Record<string, string>,
      account: {
        title: "حساب من",
        email: "ایمیل",
        name: "نام",
        joined: "عضویت",
        verified: "ایمیل تأیید شده",
        save: "ذخیره",
        saved: "ذخیره شد",
      },
    },
  },
  en: {
    meta: {
      title: "SmartLife — the device arrives ready",
      description:
        "Buy a smart device, plug it in, control it from an online panel. You enter your home Wi-Fi once at checkout and we build it into the device.",
    },
    brand: "SmartLife",
    nav: {
      products: "Products",
      how: "How it works",
      login: "Log in",
      signup: "Create account",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      title: "It arrives knowing your Wi-Fi",
      lead: "You enter your home network once, at checkout. We build it into the device. You plug it in.",
      cta: "Get started",
      secondary: "See how it works",
      scroll: "Scroll to assemble",
    },
    devices: {
      title: "Three devices to start with",
      lead: "Each one is built with its own key and connects straight to your panel.",
      thermometer: {
        name: "Thermometer",
        line: "Reports temperature and humidity, continuously.",
        detail: "You see the reading the moment it was taken, not minutes later.",
      },
      lamp: {
        name: "Lamp",
        line: "On, off, brightness, and colour.",
        detail: "You send the command and the device reports back, so you know it happened.",
      },
      camera: {
        name: "Camera",
        line: "Eyes on a room you are not in.",
        detail: "Like the others: no setup, same panel.",
      },
    },
    how: {
      title: "Three steps, and only one is yours",
      steps: [
        {
          title: "Pick a device",
          body: "Enter your home Wi-Fi name and password at checkout, and place the order.",
        },
        {
          title: "We build it",
          body: "Your network and a key belonging to that single device go inside before it ships.",
        },
        {
          title: "Plug it in",
          body: "It finds the Wi-Fi, connects to the server, and appears in your panel. That is the whole setup.",
        },
      ],
      note: "If the power goes out, the device reconnects on its own when it returns. Nothing for you to do.",
    },
    products: {
      title: "Sign in to order",
      lead: "Ordering needs an account, so the device can be built in your name.",
      cta: "Choose and order",
      hint: "Drag to see more",
      prev: "Previous product",
      next: "Next product",
      // True of all three, so it is said once for the whole rail instead of
      // being repeated on every card.
      common: "All three: no setup, your Wi-Fi already inside the device.",
      labels: {
        panel: "In the panel",
        behaviour: "How it behaves",
      },
      cards: {
        thermometer: {
          panel: "Live temperature and humidity",
          behaviour: "Reports on its own, continuously",
        },
        lamp: {
          panel: "Switch, brightness and colour",
          behaviour: "Takes a command, reports the result",
        },
        camera: {
          panel: "A view of that room",
          behaviour: "Acts when you ask it to",
        },
      },
    },
    trust: {
      title: "What sits behind the simplicity",
      items: [
        {
          title: "Every device has its own key",
          body: "A device proves who it is with a cryptographic signature each time it connects. Without it, the connection is refused.",
        },
        {
          title: "Only you can command it",
          body: "Every command is signed on its own, and the server checks whose name the device is registered under.",
        },
        {
          title: "Readings are not warehoused",
          body: "What a device sends reaches your screen live and is not stored. Only the command history is kept.",
        },
        {
          title: "You know when it drops",
          body: "Each device sends a regular sign of life. Go quiet, and the panel shows it offline right away.",
        },
      ],
    },
    closing: {
      title: "Create an account and order your first device",
      lead: "Accounts are created with a Google address and take a few seconds.",
      cta: "Create account",
      login: "I already have an account",
    },
    footer: {
      tagline: "Smart devices, with the setup step removed.",
      product: "Product",
      account: "Account",
      language: "Language",
      rights: "All rights reserved.",
    },
    auth: {
      backHome: "Back to the homepage",
      email: "Email",
      emailHint: "Gmail addresses only",
      password: "Password",
      passwordHint: "At least 8 characters",
      passwordConfirm: "Repeat password",
      fullName: "Full name",
      optional: "optional",
      code: "6-digit code",
      newPassword: "New password",
      show: "Show password",
      hide: "Hide password",
      offline: "Could not reach the server. Check your connection.",
      login: {
        title: "Log in",
        lead: "Sign in to see and control your devices.",
        submit: "Log in",
        forgot: "I forgot my password",
        noAccount: "No account yet?",
        signupLink: "Create one",
        unverified: "This address is not verified yet.",
        goVerify: "Verify it",
      },
      signup: {
        title: "Create an account",
        lead: "Sign up with a Gmail address so the device is built in your name.",
        submit: "Create account",
        haveAccount: "Already have an account?",
        loginLink: "Log in",
        mismatch: "The two passwords do not match.",
      },
      verify: {
        title: "Verify your email",
        lead: "Enter the 6-digit code we sent you.",
        sentTo: "Code sent to {email}.",
        submit: "Verify",
        resend: "Send the code again",
        resent: "If that address has an account, a new code is on its way.",
        wait: "{seconds}s until you can resend",
        success: "Email verified. You can log in now.",
      },
      forgot: {
        title: "Reset your password",
        lead: "Give us your email and we will send a reset code.",
        submit: "Send code",
        sent: "If that address has an account, a reset code is on its way.",
        backToLogin: "Back to log in",
      },
      reset: {
        title: "Set a new password",
        lead: "Enter the code you received and your new password.",
        submit: "Change password",
        success: "Password changed. You can log in now.",
      },
    },
    panel: {
      title: "My devices",
      nav: { devices: "Devices", account: "Account", logout: "Log out" },
      connection: {
        connecting: "Connecting…",
        live: "Live",
        reconnecting: "Dropped, reconnecting…",
        failed: "Live connection failed",
        retry: "Try again",
      },
      online: "Online",
      offline: "Offline",
      unknown: "State unknown",
      lastSeen: "Last seen {when}",
      never: "Never connected",
      refresh: "Refresh",
      refreshing: "Refreshing…",
      empty: {
        title: "No devices yet",
        body: "Once you buy one and it arrives, it shows up here.",
        cta: "See the products",
      },
      loading: "Loading your devices…",
      loadFailed: "Could not load your devices.",
      device: {
        readings: "Live readings",
        controls: "Controls",
        noReadings: "Nothing reported yet.",
        noReadingsOffline: "The device is offline.",
        waiting: "Waiting for the device…",
        offlineNotice: "Commands cannot be sent while the device is offline.",
        sent: "Command sent",
        done: "Done",
        failed: "Failed",
        timeout: "The device did not answer",
        history: "Recent commands",
        noHistory: "No commands sent yet.",
        back: "All devices",
        on: "On",
        off: "Off",
      },
      // English needs no overrides: the backend's own labels are already in
      // this language. The lookup falls through to them.
      capabilities: {} as Record<string, string>,
      choices: {} as Record<string, string>,
      account: {
        title: "My account",
        email: "Email",
        name: "Name",
        joined: "Joined",
        verified: "Email verified",
        save: "Save",
        saved: "Saved",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
