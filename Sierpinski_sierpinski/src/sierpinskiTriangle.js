// ==================== TAM GIAC SIERPINSKI ====================
// Thuat toan de quy: chia 1 tam giac thanh 3 tam giac con (bo tam giac giua)

export function generateSierpinskiTriangle(depth, colorFunction) {
    const vertices = [];  // Mang chua toa do cac dinh
    const colors = [];    // Mang chua mau cac dinh

    // 3 dinh cua tam giac deu ban dau (trong he toa do WebGL: -1 den +1)
    // Tinh toan de tam giac deu can giua man hinh
    const height = 1.6 * Math.sqrt(3) / 2;  // Chieu cao tam giac deu voi canh = 1.6
    const v1 = [-0.8, -height / 3];         // Dinh trai duoi
    const v2 = [0.8, -height / 3];          // Dinh phai duoi
    const v3 = [0.0, 2 * height / 3];       // Dinh tren

    // Ham tinh trung diem cua 2 diem
    function midpoint(a, b) {
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    }

    // Ham de quy chia tam giac
    function subdivide(p1, p2, p3, d) {
        // DIEU KIEN DUNG: khi depth = 0, ve tam giac nay
        if (d === 0) {
            // Them 3 dinh cua tam giac vao mang vertices
            vertices.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);

            // Tinh mau tai trong tam cua tam giac
            const cx = (p1[0] + p2[0] + p3[0]) / 3;
            const cy = (p1[1] + p2[1] + p3[1]) / 3;
            const color = colorFunction(cx, cy);

            // Moi dinh can 1 mau (3 dinh = 3 lan push)
            colors.push(...color, ...color, ...color);
            return;
        }

        // Tinh 3 trung diem cua 3 canh
        const m12 = midpoint(p1, p2);  // Trung diem canh p1-p2
        const m23 = midpoint(p2, p3);  // Trung diem canh p2-p3
        const m31 = midpoint(p3, p1);  // Trung diem canh p3-p1

        // De quy 3 tam giac con (BO QUA tam giac giua m12-m23-m31)
        subdivide(p1, m12, m31, d - 1);   // Tam giac trai duoi
        subdivide(m12, p2, m23, d - 1);   // Tam giac phai duoi
        subdivide(m31, m23, p3, d - 1);   // Tam giac tren
    }

    // Bat dau de quy tu tam giac goc
    subdivide(v1, v2, v3, depth);

    return {
        vertices,
        colors,
        triangleCount: Math.pow(3, depth),       // So tam giac = 3^depth
        vertexCount: vertices.length / 2          // So dinh (moi dinh 2 toa do)
    };
}
