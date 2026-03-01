#!/usr/bin/env bash
set -euo pipefail
mkdir -p tmp
sitemap="tmp/sitemap-0.xml"
urls_file="tmp/urls.txt"
out="tmp/seo_pages.tsv"
: > "$out"
# extract urls using perl
perl -ne 'while (/<loc>(.*?)<\/loc>/g) { print "$1\n" }' "$sitemap" > "$urls_file"
count=$(wc -l < "$urls_file" | tr -d ' ')
echo "Found $count URLs" >&2
# header
echo -e "url\thttp_code\ttitle\ttitle_len\tmeta_description\tdesc_len\threflang_count\tjsonld_count" > "$out"
export -f
# process function using curl + python parser
process_one(){
  url="$1"
  http_code=$(curl -sS --max-time 15 -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [ "$http_code" != "200" ]; then
    echo -e "$url\t$http_code\t\t0\t\t0\t0\t0"
    return
  fi
  # fetch content and parse
  parsed=$(curl -sS -L --max-time 20 "$url" | python3 tmp/parse_html.py || echo -e "\t0\t\t0\t0\t0")
  # parsed: title\ttitle_len\tdesc\tdesc_len\threflang_count\tjsonld_count
  echo -e "$url\t$http_code\t$parsed"
}
export -f process_one
# run with parallelism 10
cat "$urls_file" | xargs -n1 -P10 -I{} bash -c 'process_one "{}"' >> "$out"

echo "Done. Output: $out" >&2
