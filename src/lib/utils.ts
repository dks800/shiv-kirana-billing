import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"
import { getActiveDateFormat } from "@/lib/settings-runtime"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDate(date?: Date | Timestamp | string | null): string {
  if (!date) return "-"
  
  try {
    let dateObj: Date
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate()
    } else if (typeof date === "string") {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }
    
    if (isNaN(dateObj.getTime())) return "-"
    
    return dayjs(dateObj).format(getActiveDateFormat())
  } catch {
    return "-"
  }
}

export function amountToWords(value: number) {
  const n = Math.round(value);
  if (n === 0) return "Zero rupees only";

  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function twoDigits(num: number) {
    if (num < 20) return a[num];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return b[ten] + (unit ? " " + a[unit] : "");
  }

  function threeDigits(num: number) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return (hundred ? a[hundred] + " hundred" + (rest ? " " : "") : "") + (rest ? twoDigits(rest) : "");
  }

  // Indian number grouping: crore, lakh, thousand, hundred
  const parts: string[] = [];
  let remaining = n;

  const crore = Math.floor(remaining / 10000000);
  if (crore) {
    parts.push(threeDigits(crore) + " crore");
    remaining = remaining % 10000000;
  }

  const lakh = Math.floor(remaining / 100000);
  if (lakh) {
    parts.push(threeDigits(lakh) + " lakh");
    remaining = remaining % 100000;
  }

  const thousand = Math.floor(remaining / 1000);
  if (thousand) {
    parts.push(threeDigits(thousand) + " thousand");
    remaining = remaining % 1000;
  }

  if (remaining) {
    parts.push(threeDigits(remaining));
  }

  const words = parts.join(" ").trim();
  // Capitalize first letter and append rupees string
  return words.charAt(0).toUpperCase() + words.slice(1) + " rupees only";
}
