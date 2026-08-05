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
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
