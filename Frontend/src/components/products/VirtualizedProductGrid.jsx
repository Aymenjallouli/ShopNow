import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import ProductCard from '../ProductCard/ProductCard';

const VirtualizedProductGrid = memo(({ products, containerHeight = 800 }) => {
  // Configuration de la grille
  const ITEM_WIDTH = 280;
  const ITEM_HEIGHT = 420;
  const GAP = 20;

  // Calculer le nombre de colonnes basé sur la largeur du conteneur
  const containerWidth = window.innerWidth > 1200 ? 1200 : window.innerWidth - 40;
  const columnCount = Math.floor(containerWidth / (ITEM_WIDTH + GAP));
  const rowCount = Math.ceil(products.length / columnCount);

  // Composant Item memoized pour les cellules de la grille
  const GridItem = memo(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const product = products[index];

    if (!product) return null;

    return (
      <div
        style={{
          ...style,
          left: style.left + GAP / 2,
          top: style.top + GAP / 2,
          width: style.width - GAP,
          height: style.height - GAP,
        }}
      >
        <ProductCard product={product} />
      </div>
    );
  });

  GridItem.displayName = 'GridItem';

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">No products found</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={ITEM_WIDTH + GAP}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={ITEM_HEIGHT + GAP}
        width={containerWidth}
        className="mx-auto"
        style={{ overflow: 'auto' }}
      >
        {GridItem}
      </Grid>
    </div>
  );
});

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid';

export default VirtualizedProductGrid;
