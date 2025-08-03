
export function createDefaultImage() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const size = 200;
    tempCanvas.width = size;
    tempCanvas.height = size;

    // Create animated particle-like gradient background
    const gradient = tempCtx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/1.4);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.3, '#764ba2');
    gradient.addColorStop(0.6, '#f093fb');
    gradient.addColorStop(1, '#f5576c');

    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, size, size);

    // Add particle effect dots
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 0.5;
        
        tempCtx.beginPath();
        tempCtx.arc(x, y, radius, 0, Math.PI * 2);
        tempCtx.fill();
    }

    // Add some glowing particles
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 4 + 1;
        
        // Create glow effect
        const glowGradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius * 3);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        tempCtx.fillStyle = glowGradient;
        tempCtx.beginPath();
        tempCtx.arc(x, y, radius * 3, 0, Math.PI * 2);
        tempCtx.fill();
        
        // Core particle
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        tempCtx.beginPath();
        tempCtx.arc(x, y, radius, 0, Math.PI * 2);
        tempCtx.fill();
    }

    // Create stylized "PFX" text with particle effect
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    tempCtx.font = 'bold 32px Arial';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    
    // Add text shadow/glow
    tempCtx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    tempCtx.shadowBlur = 10;
    tempCtx.shadowOffsetX = 0;
    tempCtx.shadowOffsetY = 0;
    
    tempCtx.fillText('PFX', size / 2, size / 2);

    // Add connecting lines between some particles for network effect
    tempCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    tempCtx.lineWidth = 1;
    tempCtx.beginPath();
    
    // Create some random connecting lines
    for (let i = 0; i < 8; i++) {
        const startX = Math.random() * size;
        const startY = Math.random() * size;
        const endX = startX + (Math.random() - 0.5) * 60;
        const endY = startY + (Math.random() - 0.5) * 60;
        
        tempCtx.moveTo(startX, startY);
        tempCtx.lineTo(endX, endY);
    }
    tempCtx.stroke();

    // Reset shadow
    tempCtx.shadowColor = 'transparent';
    tempCtx.shadowBlur = 0;

    return tempCanvas.toDataURL();
}
