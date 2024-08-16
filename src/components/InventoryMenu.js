import React from 'react';

const InventoryMenu = ({ items, onItemClick }) => {
  return (
    <div style={styles.menuContainer}>
      {items && Object.values(items["basic"]).map((item, index) => (
        <div
          key={index}
          style={{
            ...styles.menuItem,
            opacity: item.disabled ? 0.5 : 1,
            pointerEvents: item.disabled ? 'none' : 'auto',
          }}
          onClick={() => !item.disabled && onItemClick(item)}
        >
          {item.icon}
          <div style={styles.quantity}>{item.quantity}</div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  menuContainer: {
    position: 'fixed', // Use 'fixed' to position it relative to the viewport
    bottom: '10px', // Positioned 10px from the bottom
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    backgroundColor: '#333',
    padding: '10px',
    borderRadius: '10px',
    zIndex: 2,
  },
  menuItem: {
    position: 'relative',
    width: '50px',
    height: '50px',
    margin: '0 5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  quantity: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    color: '#fff',
    backgroundColor: '#000',
    borderRadius: '50%',
    padding: '2px 5px',
    fontSize: '12px',
  },
};

export default InventoryMenu;
