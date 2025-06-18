<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Codepacker - Guest Book</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

    <style>
        :root {
            --primary-color: #2563eb;
            --primary-dark: #1e40af;
            --primary-light: #60a5fa;
            --bg-light: #f8fafc;
            --text-dark: #1e293b;
            --text-light: #94a3b8;
            --white: #ffffff;
            --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-light);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 1200px;
            padding: 2rem;
        }

        .card {
            background: var(--white);
            border: none;
            border-radius: 16px;
            box-shadow: var(--shadow);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .card-header {
            background: var(--primary-color);
            color: var(--white);
            border: none;
            padding: 2rem;
            position: relative;
            border-radius: 16px 16px 0 0 !important;
        }

        .card-body {
            padding: 2.5rem;
        }

        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            border-radius: 10px;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
            border-color: var(--primary-dark);
            transform: translateY(-2px);
        }

        .btn-icon {
            margin-right: 0.75rem;
            font-size: 1.1rem;
        }

        .app-title {
            font-weight: 700;
            margin-bottom: 0.5rem;
            font-size: 2.25rem;
        }

        .app-tagline {
            font-weight: 400;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .card-header-icon {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
        }

        .footer {
            text-align: center;
            color: var(--text-light);
            font-size: 0.875rem;
            margin-top: 2rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .card-header {
                padding: 1.5rem;
            }
            
            .card-body {
                padding: 1.5rem;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="card">
            <div class="card-header text-center">
                <i class="fas fa-book-open card-header-icon"></i>
                <h1 class="app-title">Codepacker Guest Book</h1>
                <p class="app-tagline">Welcome to our digital guest book application</p>
            </div>
            <div class="card-body d-flex flex-column">
                <a href="form.html" class="btn btn-primary">
                    <i class="fas fa-user-plus btn-icon"></i>Sign Guest Book
                </a>
                <a href="view.html" class="btn btn-primary">
                    <i class="fas fa-table btn-icon"></i>View Guest Entries
                </a>
            </div>
        </div>
        
        <div class="footer">
            &copy; 2023 Codepacker Guest Book - All rights reserved
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
