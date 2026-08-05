#!/usr/bin/env python3
"""
Batch update all HTML files in paycheck-calculator:
1. Clean URL nav/footer links (remove .html extensions)
2. Update year references from 2025 to 2026
3. Update SS wage base, standard deduction amounts
4. Update overtime threshold references
"""
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))

# Replacements to apply to all HTML files
# Each tuple: (old_string, new_string)
REPLACEMENTS = [
    # Nav/footer clean URL links
    ('/hourly-to-salary.html', '/hourly-to-salary'),
    ('/salary-to-hourly.html', '/salary-to-hourly'),
    ('/overtime-calculator.html', '/overtime-calculator'),

    # Year and data updates
    ('2025 federal and', '2026 federal and'),
    ('2025 federal income tax brackets', '2026 federal income tax brackets'),
    ('2025 federal tax brackets', '2026 federal tax brackets'),
    ('2025 tax brackets', '2026 tax brackets'),
    ('2025 tax rates', '2026 tax rates'),
    ('2025 FLSA rules', 'current FLSA rules'),
    ('2025 FLSA', 'current FLSA'),

    # SS wage base
    ('$176,100 in 2025', '$184,500 in 2026'),
    ('$176,100 in 2026', '$184,500 in 2026'),  # catch any already-partially-updated

    # Standard deduction in index.html
    ('$15,000 for single filers in 2025', '$16,100 for single filers in 2026'),
    ('$15,000 for single filers in 2026', '$16,100 for single filers in 2026'),

    # Overtime threshold (in case any remain)
    ('$43,888/year in 2025', '$35,568/year ($684/week) under the current FLSA standard salary level'),
    ('$43,888/year', '$35,568/year ($684/week)'),
]

# Files to process
html_files = [f for f in os.listdir(BASE) if f.endswith('.html')]

changed_files = []
total_replacements = 0

for filename in sorted(html_files):
    filepath = os.path.join(BASE, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    file_replacements = 0

    for old, new in REPLACEMENTS:
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            file_replacements += count

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        changed_files.append((filename, file_replacements))
        total_replacements += file_replacements

print(f"Processed {len(html_files)} HTML files")
print(f"Modified {len(changed_files)} files with {total_replacements} total replacements")
print("\nModified files:")
for fname, count in changed_files:
    print(f"  {fname}: {count} replacements")
