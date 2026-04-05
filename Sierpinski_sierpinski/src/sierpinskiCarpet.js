// ==================== THAM SIERPINSKI (SIERPINSKI CARPET) ====================
// Thuat toan de quy: chia 1 hinh vuong thanh luoi 3x3, bo o giua, lap lai

export function generateSierpinskiCarpet(depth, colorFunction) {
    const vertices = [];  // Mang chua toa do cac dinh
    const colors = [];    // Mang chua mau cac dinh

    // Hinh vuong ban dau: goc trai duoi (-0.85, -0.85), canh = 1.7
    const startX = -0.85;
    const startY = -0.85;
    const size = 1.7;

    // Ham de quy chia hinh vuong
    function subdivide(x, y, s, d) {
        // DIEU KIEN DUNG: khi depth = 0, ve hinh vuong nay
        if (d === 0) {
            // WebGL chi ve duoc tam giac → 1 hinh vuong = 2 tam giac

            // Tam giac 1: nua duoi-trai cua hinh vuong
            //   (x,y) --- (x+s,y)
            //     |      /
            //   (x,y+s)
            vertices.push(
                x, y,
                x + s, y,
                x, y + s
            );

            // Tam giac 2: nua tren-phai cua hinh vuong
            //          (x+s,y)
            //           /    |
            //   (x,y+s) --- (x+s,y+s)
            vertices.push(
                x + s, y,
                x + s, y + s,
                x, y + s
            );

            // Tinh mau tai tam hinh vuong
            const cx = x + s / 2;
            const cy = y + s / 2;
            const color = colorFunction(cx, cy);

            // 6 dinh (2 tam giac x 3 dinh), moi dinh can 1 mau
            for (let i = 0; i < 6; i++) {
                colors.push(...color);
            }
            return;
        }

        // Chia hinh vuong thanh luoi 3x3
        const newSize = s / 3;

        for (let i = 0; i < 3; i++) {       // Cot (truc x)
            for (let j = 0; j < 3; j++) {   // Hang (truc y)
                // BO QUA O GIUA (i=1, j=1) → tao "lo" giua hinh vuong
                if (i === 1 && j === 1) continue;

                // De quy cho 8 o con lai
                subdivide(
                    x + i * newSize,    // Vi tri x moi = goc x + cot * kich thuoc moi
                    y + j * newSize,    // Vi tri y moi = goc y + hang * kich thuoc moi
                    newSize,            // Kich thuoc moi = 1/3 kich thuoc cu
                    d - 1               // Giam depth
                );
            }
        }
    }

    // Bat dau de quy tu hinh vuong goc
    subdivide(startX, startY, size, depth);

    return {
        vertices,
        colors,
        squareCount: Math.pow(8, depth),         // So hinh vuong = 8^depth
        vertexCount: vertices.length / 2          // So dinh
    };
}
