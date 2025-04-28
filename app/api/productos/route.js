import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT p.id, p.titulo, p.precio, p.stock, c.id AS categoria_id, c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.titulo
    `;
    
    const result = await executeQuery(query, []);
    
    const productos = result.rows.map(producto => ({
      ...producto,
      precio: parseFloat(producto.precio)
    }));
    
    return NextResponse.json({ productos });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { titulo, categoria_id, precio, stock } = await request.json();
    
    if (!titulo || titulo.trim() === '') {
      return NextResponse.json(
        { error: 'El título del producto es obligatorio' },
        { status: 400 }
      );
    }
    
    if (!categoria_id) {
      return NextResponse.json(
        { error: 'La categoría es obligatoria' },
        { status: 400 }
      );
    }
    
    if (!precio || precio <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número positivo' },
        { status: 400 }
      );
    }
    
    if (stock < 0) {
      return NextResponse.json(
        { error: 'El stock no puede ser negativo' },
        { status: 400 }
      );
    }
    
    // Verificar que la categoría existe
    const categoriaCheck = await executeQuery(
      'SELECT id FROM categorias WHERE id = ?',
      [categoria_id]
    );
    
    if (categoriaCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 404 }
      );
    }
    
    // Insertar el producto en la base de datos
    const result = await executeQuery(
      'INSERT INTO productos (titulo, categoria_id, precio, stock) VALUES (?, ?, ?, ?)',
      [titulo, categoria_id, precio, stock]
    );
    
    const insertId = result.rows.insertId;
    
    if (insertId) {
      const insertedProducto = await executeQuery(
        `SELECT p.id, p.titulo, p.precio, p.stock, c.id AS categoria_id, c.nombre AS categoria_nombre
         FROM productos p
         JOIN categorias c ON p.categoria_id = c.id
         WHERE p.id = ?`,
        [insertId]
      );
      
      if (insertedProducto.rows.length > 0) {
        const producto = {
          ...insertedProducto.rows[0],
          precio: parseFloat(insertedProducto.rows[0].precio)
        };
        
        return NextResponse.json(
          { success: true, message: 'Producto creado correctamente', producto },
          { status: 201 }
        );
      }
    }
    
    return NextResponse.json(
      { success: true, message: 'Producto creado correctamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error al crear producto: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID del producto' },
        { status: 400 }
      );
    }
    
    // Verificar que el producto existe antes de intentar eliminarlo
    const checkProducto = await executeQuery(
      'SELECT id FROM productos WHERE id = ?',
      [id]
    );
    
    if (checkProducto.rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró el producto con el ID proporcionado' },
        { status: 404 }
      );
    }
    
    // Proceder con la eliminación
    const result = await executeQuery(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );
    
    if (result.rows.affectedRows > 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Producto eliminado correctamente'
      });
    } else {
      return NextResponse.json(
        { error: 'No se pudo eliminar el producto' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto: ' + error.message },
      { status: 500 }
    );
  }
}
