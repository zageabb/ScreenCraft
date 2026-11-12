#!/usr/bin/env python3
"""Regenerate the ScreenCraft editor's pinned catalogue snapshot from Application-Standard.

Usage:
  python3 scripts/sync_scraft_catalogue.py path/to/standards/screencraft/object-catalogue.json --source-sha GIT_BLOB_SHA

This script never defines new objects or changes the canonical repository.
Review and commit the diff after updating the upstream Application-Standard file.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

SOURCE = "zageabb/Application-Standard/standards/screencraft/object-catalogue.json"
DEST = Path(__file__).resolve().parents[1] / "frontend/src/catalogue.snapshot.json"

def snapshot(document: dict, sha: str) -> dict:
    objects = document["objects"]
    ids = [item["id"] for item in objects]
    if len(ids) != len(set(ids)):
        raise ValueError("Canonical object catalogue contains duplicate IDs")
    return {
        "canonical_source": SOURCE,
        "source_blob_sha": sha,
        "catalogue_id": document["catalogue_id"],
        "catalogue_version": document["catalogue_version"],
        "objects": [
            {key: item[key] for key in (
                "id", "category", "level", "description",
                "container", "property_groups", "unsupported_behavior"
            )}
            for item in objects
        ],
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalogue", type=Path)
    parser.add_argument("--source-sha", required=True,
                        help="Git blob SHA of the reviewed canonical catalogue")
    args = parser.parse_args()
    source = json.loads(args.catalogue.read_text(encoding="utf-8"))
    output = snapshot(source, args.source_sha)
    DEST.write_text(json.dumps(output, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(f"Pinned {len(output['objects'])} canonical objects from {args.source_sha}")

if __name__ == "__main__":
    main()
