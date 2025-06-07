// src/app/page.tsx
"use client";

import React, { useState } from 'react';

export default function Home() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: "1. Co to jest presale tokena Velmere (VLM)?",
      answer: "Presale to wstępna sprzedaż tokenów Velmere, dzięki której możesz kupić VLM po atrakcyjnej, bazowej cenie zanim token trafi na giełdy. To świetna okazja na udział w rozwoju projektu Velmere."
    },
    {
      question: "2. Jakie blockchainy obsługuje presale?",
      answer: "Presale działa na trzech blockchainach: Solana, Ethereum oraz SUI. Dzięki temu masz wybór sieci, którą preferujesz."
    },
    {
      question: "3. Jaka jest cena tokena podczas presale?",
      answer: "Bazowa cena to 0.001 (w SOL, ETH lub SUI) za 1 token VLM. Cena wzrasta co 7 dni o 5%, więc warto kupować wcześniej, by złapać najlepszą cenę."
    },
    {
      question: "4. Czy jest minimalna kwota zakupu?",
      answer: "Tak, minimalna kwota zakupu to równowartość 10 dolarów. Dzięki temu każdy może wziąć udział, nawet z małym budżetem."
    },
    {
      question: "5. Czy jest limit maksymalny na zakup?",
      answer: "Nie ma limitu maksymalnego — możesz kupić dowolną ilość tokenów, jeśli tylko chcesz."
    },
    {
      question: "6. Jak mogę zapłacić za tokeny?",
      answer: "Płatności przyjmujemy w kryptowalutach: SOL, ETH oraz SUI. Wybierz sieć i podłącz swój portfel, aby dokonać zakupu."
    },
    {
      question: "7. Jak połączyć swój portfel?",
      answer: "Obsługujemy portfele kompatybilne z Solana (np. Phantom), Ethereum i SUI (np. portfele zgodne z blockchainem SUI). Wystarczy wybrać sieć i połączyć swój portfel za pomocą przycisku „Connect Wallet”."
    },
    {
      question: "8. Kiedy otrzymam zakupione tokeny?",
      answer: "Tokeny zostaną rozesłane dopiero po zakończeniu presale, czyli po osiągnięciu celu finansowego lub zakończeniu okresu sprzedaży."
    },
    {
      question: "9. Co się stanie, jeśli nie osiągniemy celu?",
      answer: "Jeśli presale się nie uda, zwrócimy środki uczestnikom zgodnie z warunkami projektu."
    },
    {
      question: "10. Czy mogę kupić tokeny z więcej niż jednej sieci?",
      answer: "Tak, możesz dokonywać zakupów na dowolnej obsługiwanej sieci, ale pamiętaj, że tokeny i transakcje są oddzielne dla każdej z nich."
    },
    {
      question: "11. Czy muszę znać się na kryptowalutach, żeby wziąć udział?",
      answer: "Nie, cały proces jest maksymalnie uproszczony. Jeśli masz portfel i trochę kryptowaluty, poradź się instrukcji na stronie — wszystko wyjaśniamy krok po kroku."
    },
    {
      question: "12. Czy presale jest bezpieczne?",
      answer: "Tak, projekt korzysta z bezpiecznych, sprawdzonych protokołów i połączeń z portfelami. Nie przechowujemy Twoich środków — transakcje realizujesz bezpośrednio ze swojego portfela."
    },
    {
      question: "13. Co jeśli mam problem techniczny?",
      answer: "Skontaktuj się z nami przez formularz kontaktowy na stronie lub napisz maila na velmere141@gmail.com. Pomożemy rozwiązać wszelkie trudności."
    },
    {
      question: "14. Gdzie mogę znaleźć więcej informacji o projekcie Velmere?",
      answer: "Wszystkie aktualności i dokumenty znajdziesz na naszej stronie głównej velmere.pl oraz w mediach społecznościowych."
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      {/* Sekcja Powitalna / Główny Nagłówek */}
      <section
        id="hero"
        className="text-center mb-20 animate-fade-in-up delay-100"
      >
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 text-gold-500">
          VELMERE
        </h1>
        <p className="mt-4 text-xl md:text-2xl lg:text-3xl font-light max-w-2xl mx-auto text-gray-300">
          Luksusowa moda spotyka technologię blockchain.
        </p>
      </section>

      {/* Sekcja: Wprowadzenie (o marce Velmere) */}
      <section
        id="o-marce"
        className="w-full max-w-4xl text-center mb-20 p-8 border-b border-gray-800 animate-fade-in-up delay-200"
      >
        <h2 className="text-4xl font-bold mb-6 text-gold-500">O Marce Velmere</h2>
        <p className="text-lg leading-relaxed text-gray-300">
          Velmere to nowa definicja luksusu, łącząca rzemieślniczą perfekcję z innowacyjnym podejściem do technologii blockchain. Nasze unikalne produkty to nie tylko odzież i akcesoria, to dzieła sztuki, których autentyczność i pochodzenie są trwale zapisane w cyfrowym świecie.
        </p>
      </section>

      {/* Sekcja: Wartość Rzeczywista (ręczna produkcja) */}
      <section
        id="wartosc-rzeczywista"
        className="w-full max-w-4xl text-center mb-20 p-8 border-b border-gray-800 animate-fade-in-up delay-300"
      >
        <h2 className="text-4xl font-bold mb-6 text-gold-500">
          Wartość Rzeczywista
        </h2>
        <p className="text-lg leading-relaxed text-gray-300">
          Wierzymy, że prawdziwy luksus tkwi w detalu, precyzji i pasji twórcy.
          Każdy produkt Velmere jest efektem wielogodzinnej, ręcznej pracy
          doświadczonych rzemieślników. Dzięki temu masz pewność, że otrzymujesz
          produkt niepowtarzalny, stworzony z najwyższą dbałością o każdy
          szczegół.
        </p>
      </section>

      {/* Sekcja: Tokenomia VLM */}
      <section
        id="tokenomia"
        className="w-full max-w-4xl text-center mb-20 p-8 border-b border-gray-800 animate-fade-in-up delay-400"
      >
        <h2 className="text-4xl font-bold mb-6 text-gold-500">Tokenomia VLM</h2>
        <p className="text-lg leading-relaxed text-gray-300">
          Token VLM to serce ekosystemu Velmere. Umożliwia dostęp do
          ekskluzywnych kolekcji, zniżek, a także udział w przyszłych decyzjach
          dotyczących rozwoju marki. Posiadanie VLM to nie tylko inwestycja, ale i
          klucz do świata luksusu i innowacji.
        </p>
        <ul className="text-left mx-auto max-w-md mt-6 text-lg list-disc list-inside text-gray-300">
          <li>Całkowita podaż: 100,000,000 VLM</li>
          <li>Zespół(z vestingiem): 15%</li>
          <li>Presale: 20% Publiczna sprzedaż tokenów</li>
          <li>Marketing i partnerstwa: 25% Kampani, influencerzy, współprace</li>
          <li>płynność: 20% dostarczona po zakończeniu presale</li>
          <li>Rezerwa strategiczna: 10% Potencjalne listingi, rozwój</li>
          <li>Społeczność i airdropy: 10% Nagrody, staking, konkursy</li>
        </ul>
      </section>

      {/* Sekcja: Roadmap */}
      <section
        id="roadmap"
        className="w-full max-w-4xl text-center mb-20 p-8 border-b border-gray-800 animate-fade-in-up delay-500"
      >
        <h2 className="text-4xl font-bold mb-6 text-gold-500">Roadmap</h2>
        <p className="text-lg leading-relaxed text-gray-300">
          Nasza ścieżka rozwoju jest klarownie zdefiniowana. Dążymy do integracji
          technologii blockchain w każdym aspekcie naszej działalności, od
          weryfikacji autentyczności po programy lojalnościowe.
        </p>
        <ul className="text-left mx-auto max-w-md mt-6 text-lg list-decimal list-inside text-gray-300">
          <li>Q2 2025: Start projektu, kampania marketingowa, uruchomienie presale</li>
          <li>Q3 2025: Budowa społeczności, rozwój strony, współprace strategiczne</li>
          <li>Q4 2025: Zakończenie presale, listing tokena na DEX, wysyłka tokenów </li>
          <li>Q1 2026: Wprowadzenie na giełdy DEX/CEX, Rozszerzenie kolekcji</li>
          <li>Q2 2026: Integracja z systemem zakupów odzieży za pomocą VLM</li>
        </ul>
      </section>

      {/* Sekcja: Kontakt */}
      <section
        id="kontakt"
        className="w-full max-w-4xl text-center p-8 animate-fade-in-up delay-600"
      >
        <h2 className="text-4xl font-bold mb-6 text-gold-500">Kontakt</h2>
        <p className="text-lg leading-relaxed mb-4 text-gray-300">
          Masz pytania? Chętnie odpowiemy! Skontaktuj się z nami poprzez nasze
          kanały społecznościowe lub wyślij wiadomość na e-mail:
          Velmere141@gmail.com.
        </p>
        <div className="flex justify-center space-x-6 text-2xl">
          <a
            href="https://x.com/markvelmere"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition-colors duration-300"
          >
            X (Twitter)
          </a>
          <a
            href="https://www.tiktok.com/@mark_velmere"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition-colors duration-300"
          >
            TikTok
          </a>
        </div>
      </section>

      {/* Nowa Sekcja: FAQ */}
      <section
        id="faq"
        className="w-full max-w-4xl text-center mb-20 p-8 border-t border-gray-800 animate-fade-in-up delay-700"
      >
        <h2 className="text-4xl font-bold mb-10 text-gold-500">
          Najczęściej Zadawane Pytania (FAQ)
        </h2>
        <div className="text-left mx-auto max-w-2xl">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="mb-4 border-b border-gray-700 pb-4 last:border-b-0"
            >
              <button
                className="flex justify-between items-center w-full text-xl font-semibold py-2 cursor-pointer hover:text-yellow-400 transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-gray-300">{item.question}</span>
                <span className="text-gray-300">
                  {openQuestion === index ? "−" : "+"}
                </span>
              </button>
              {openQuestion === index && (
                <p className="mt-2 text-lg text-gray-300 animate-fadeIn duration-500">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stopka (opcjonalnie) */}
      <footer className="w-full text-center mt-20 pt-8 border-t border-gray-800 text-sm text-gray-500 animate-fade-in-up delay-800">
        <p>&copy; {new Date().getFullYear()} Velmere. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </main>
  );
}