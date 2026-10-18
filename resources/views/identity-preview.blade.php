<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ $title }}</title>
    <link rel="icon" href="/brgyLogo.png?v=2" type="image/png">
    <link rel="apple-touch-icon" href="/brgyLogo.png?v=2">
    <style>
        :root {
            color-scheme: light;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
        }

        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; }

        header img { width: 40px; height: 40px; object-fit: contain; }
        header strong { display: block; font-size: 14px; }
        header span { display: block; margin-top: 3px; color: #64748b; font-size: 12px; }
        main {
            display: grid;
            min-height: calc(100vh - 69px);
            place-items: center;
            padding: 24px;
        }
        main img {
            display: block;
            max-width: min(100%, 1100px);
            max-height: calc(100vh - 120px);
            object-fit: contain;
            border-radius: 12px;
            background: white;
            box-shadow: 0 12px 36px rgb(15 23 42 / 14%);
        }
    </style>
</head>
<body>
    <main>
        <img src="{{ $imageUrl }}" alt="{{ $sideLabel }} image for request {{ $requestId }}">
    </main>
</body>
</html>
