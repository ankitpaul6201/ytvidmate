import argparse
import json
import os
import sys

from app.core.security import validate_public_url
from app.services.ytdlp_service import download_media, extract_media_info


def main():
    parser = argparse.ArgumentParser(description="YTVidMate CLI Core Engine Runner")
    parser.add_argument("--url", help="URL to process")
    parser.add_argument("--info-only", action="store_true", help="Extract info only")
    parser.add_argument(
        "--type", choices=["video", "audio"], default="video", help="Media type"
    )
    parser.add_argument(
        "--height", type=int, default=720, help="Max resolution height"
    )
    parser.add_argument("--outdir", default="./downloads", help="Output directory")
    parser.add_argument(
        "--run-fixtures",
        action="store_true",
        help="Run batch test on fixture URLs",
    )

    args = parser.parse_args()

    if args.run_fixtures:
        fixture_path = os.path.join(
            os.path.dirname(__file__), "tests", "fixtures", "test_urls.json"
        )
        if not os.path.exists(fixture_path):
            print(f"Fixture file not found: {fixture_path}")
            sys.exit(1)

        with open(fixture_path, encoding="utf-8") as f:
            samples = json.load(f)

        print(
            f"--- YTVidMate Core Engine Smoke Test ({len(samples)} samples) ---"
        )
        passed = 0
        for idx, item in enumerate(samples, 1):
            url = item["url"]
            name = item["name"]
            print(f"\n[{idx}/{len(samples)}] Testing: {name}")
            try:
                # 1. Validate URL (SSRF check)
                validate_public_url(url)
                # 2. Extract metadata
                info = extract_media_info(url)
                print(f"  [OK] Info extracted: '{info.title}' (ID: {info.id})")
                print(f"  [OK] Available format options: {len(info.formats)}")
                passed += 1
            except Exception as e:
                print(f"  [FAIL] Failed: {e}")

        print(
            f"\n--- Smoke Test Summary: {passed}/{len(samples)} samples passed ---"
        )
        sys.exit(0 if passed == len(samples) else 1)

    if not args.url:
        print("Please provide --url or --run-fixtures")
        sys.exit(1)

    print(f"Processing URL: {args.url}")
    try:
        clean_url = validate_public_url(args.url)
        print(f"[OK] URL validated: {clean_url}")

        info = extract_media_info(clean_url)
        print(f"[OK] Title: {info.title}")
        print(f"[OK] Duration: {info.duration}s")
        print("[OK] Available formats:")
        for fmt in info.formats:
            print(f"   - {fmt.label} [{fmt.format_id}]")

        if args.info_only:
            return

        os.makedirs(args.outdir, exist_ok=True)

        def progress(d):
            print(f"Progress: {d.get('status')} {d.get('percent')}%", end="\r")

        print("\nStarting download...")
        filename = download_media(
            url=clean_url,
            target_dir=args.outdir,
            height=args.height,
            media_type=args.type,
            progress_callback=progress,
        )
        out_file = os.path.join(args.outdir, filename)
        print(f"\n[OK] Download completed successfully: {out_file}")

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
