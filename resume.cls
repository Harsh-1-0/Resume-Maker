% -------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs
% License : MIT
% ------------------------

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2021/03/21 Resume Class]

\LoadClass[10pt,letterpaper]{article}

\RequirePackage[left=0.75in,top=0.5in,right=0.75in,bottom=0.5in]{geometry}
\RequirePackage{titlesec}
\RequirePackage{enumitem}
\RequirePackage{ifthen}
\RequirePackage{hyperref}
\RequirePackage{fontawesome}
\RequirePackage{tabularx}
\RequirePackage{multicol}

% No page numbers
\pagestyle{empty}

% Adjust section spacing and title formatting
\titleformat{\section}{
  \vspace{-6pt}\scshape\raggedright\large
}{}{0em}{}[\titlerule\vspace{-4pt}]

% Command for name and contact info
\newcommand{\name}[1]{ % name
  \begin{center}
    {\Huge \scshape #1}\\
  \end{center}
}

\newcommand{\contact}[1]{ % contact info
  \begin{center}
    #1
  \end{center}
}

% Environment for resume sections
\newenvironment{rSection}[1]{
  \section*{#1}
  \begin{itemize}[
    leftmargin=0.15in,
    label={},
    itemsep=0.6em,   % ✅ Adds space between items
    parsep=0.6em,    % ✅ Adds space between paragraphs
    topsep=0.2em     % ✅ Slight top spacing for clean look
  ]
}{
  \end{itemize}
  \vspace{0pt}
}

% Environment for sub-sections (e.g., experience entries)
\newenvironment{rSubsection}[4]{
  \item
  \textbf{#1} \hfill #2 \\
  \textit{#3} \hfill \textit{#4}
  \begin{itemize}[leftmargin=0.15in, label={--}]
}{
  \end{itemize}
  \vspace{0pt}
}

% Command for skills list
\newcommand{\skillsection}[1]{
  \section*{Skills}
  \begin{tabularx}{\textwidth}{X}
    #1
  \end{tabularx}
}

% Link formatting
\hypersetup{
  colorlinks=true,
  urlcolor=blue
}

% Adjust list spacing
\setlist[itemize]{noitemsep, topsep=0pt}

% Remove paragraph indentation
\setlength{\parindent}{0pt}
