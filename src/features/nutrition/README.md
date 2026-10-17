# Nutrition

Owns nutrient calculations, food diary entries, and product lookup contracts.
Future diary entries must retain a nutrient snapshot, including quantities and
units, so editing a product or changing providers cannot alter past diary totals.
Food databases and barcode providers will implement feature-owned interfaces in
infrastructure; provider-specific responses must be mapped into domain types.
