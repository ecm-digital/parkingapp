# 🚗 ParkingSpot - Prototyp Rezerwacji Parkingu

Nowoczesny prototyp UX/UI aplikacji do rezerwacji miejsc parkingowych dla małych busów, stworzony zgodnie z wymaganiami PRD.

## 🎯 Cel Projektu

Umożliwienie nowym użytkownikom (bez konta) szybkie i intuicyjne dokonanie rezerwacji parkingu dla małego busa na wybranym placu, określając pełny okres najmu.

## ✨ Kluczowe Funkcjonalności

- **Brak obowiązku rejestracji** - użytkownicy mogą rozpocząć rezerwację natychmiast
- **Wybór pojazdu** - domyślnie ustawiony na "mały bus"
- **Interaktywny wybór placu** - 3 dostępne place parkingowe z różnymi cenami
- **Kalendarz dat najmu** - intuicyjny wybór okresu od-do
- **Sprawdzanie dostępności** - symulacja wolnych miejsc w czasie rzeczywistym
- **Minimalistyczny formularz** - tylko niezbędne dane kontaktowe
- **Potwierdzenie rezerwacji** - z możliwością pobrania dokumentu

## 🎨 Cechy UX/UI

- **Mobile-first design** - zoptymalizowane pod urządzenia mobilne
- **Responsywny interfejs** - dostosowuje się do wszystkich rozmiarów ekranów
- **Nowoczesna stylistyka** - gradienty, animacje, czytelna typografia
- **Intuicyjna nawigacja** - wyraźna hierarchia wizualna i minimalna liczba kroków
- **Progress indicator** - użytkownik zawsze wie, na którym etapie się znajduje
- **Walidacja formularzy** - natychmiastowa informacja zwrotna

## 🛠️ Technologie

- **HTML5** - semantyczna struktura dokumentu
- **CSS3** - nowoczesne style z flexbox/grid, animacje
- **Vanilla JavaScript** - interaktywność bez zewnętrznych zależności
- **Font Awesome** - ikony
- **Google Fonts (Inter)** - nowoczesna typografia

## 📁 Struktura Projektu

```
parking-reservation/
├── index.html          # Główna struktura aplikacji
├── styles.css          # Style CSS z responsywnym designem
├── script.js           # Logika aplikacji i zarządzanie stanem
└── README.md           # Dokumentacja projektu
```

## 🚀 Uruchomienie

1. Sklonuj repozytorium:
```bash
git clone [URL_REPOZYTORIUM]
cd parking-reservation
```

2. Uruchom lokalny serwer:
```bash
# Python 3
python -m http.server 3000

# Lub Python 2
python -m SimpleHTTPServer 3000

# Lub Node.js
npx serve -p 3000
```

3. Otwórz przeglądarkę i przejdź do `http://localhost:3000`

## 📱 Przepływ Użytkownika

### Krok 1: Wybór Placu i Pojazdu
- Wybór z 3 dostępnych placów parkingowych
- Domyślnie wybrany typ pojazdu: "Mały bus"
- Informacje o cenach i udogodnieniach

### Krok 2: Wybór Dat
- Kalendarz do wyboru daty rozpoczęcia i zakończenia
- Automatyczne liczenie liczby dni i kosztu całkowitego
- Walidacja dat (data końcowa nie może być wcześniejsza niż początkowa)

### Krok 3: Wybór Miejsca
- Wyświetlenie dostępnych miejsc parkingowych
- Symulacja dostępności (70% szans na dostępność miejsca)
- Informacje o cechach każdego miejsca

### Krok 4: Dane Kontaktowe
- Formularz z minimalnymi wymaganymi polami
- Walidacja email i wymaganych pól w czasie rzeczywistym
- Podsumowanie całej rezerwacji

### Krok 5: Potwierdzenie
- Wyświetlenie szczegółów rezerwacji
- Unikalny numer rezerwacji
- Możliwość pobrania potwierdzenia w formacie tekstowym

## 🎯 Założenia Projektowe (UX Reasoning)

1. **Brak rejestracji na start** - redukcja bariery wejścia i drop-off rate
2. **Wizualizacja miejsc** - naturalna mapa mentalna użytkowników
3. **Wybór pojazdu jako filtr** - unikanie frustracji z niepasującymi miejscami
4. **Minimalizacja kroków** - zwiększenie użyteczności i zmniejszenie porzuceń
5. **Wyraźna hierarchia wizualna** - ułatwienie podejmowania decyzji
6. **Responsywność** - dostępność na wszystkich urządzeniach

## 📊 Dane Testowe

Aplikacja zawiera przykładowe dane dla 3 placów parkingowych:

- **Centrum Handlowe** - 25 zł/dzień, monitoring 24/7
- **Dworzec Główny** - 20 zł/dzień, monitoring + WiFi
- **Lotnisko** - 35 zł/dzień, monitoring + transfer

Każdy plac ma 6 dostępnych miejsc parkingowych z różnymi cechami.

## 🔮 Przyszłe Rozszerzenia

- Integracja z systemami płatności online
- Powiadomienia SMS/email
- Mapa z nawigacją GPS
- System kont dla stałych klientów
- API do zarządzania miejscami parkingowymi
- Panel administracyjny

## 📝 Licencja

Ten projekt został stworzony jako prototyp UX/UI zgodnie z wymaganiami PRD.

---

**Autor:** Vibe Coding Team  
**Data:** Sierpień 2025  
**Wersja:** 1.0.0
