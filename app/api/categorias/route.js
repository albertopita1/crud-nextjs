import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Obtener todas las categorías
export async function GET() {
  try {
    const result = await executeQuery('SELECT * FROM categorias', []);
    return NextResponse.json({ categorias: result.rows });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

// Crear una nueva categoría
export async function POST(request) {
  try {
    const { nombre } = await request.json();
    
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      'INSERT INTO categorias (nombre) VALUES (?)',
      [nombre]
    );
    
    const insertId = result.rows.insertId;
    
    if (insertId) {
      const insertedCategoria = await executeQuery(
        'SELECT * FROM categorias WHERE id = ?', 
        [insertId]
      );
      
      if (insertedCategoria.rows.length > 0) {
        return NextResponse.json({ categoria: insertedCategoria.rows[0] }, { status: 201 });
      }
    }
    
    return NextResponse.json({ success: true, message: 'Categoría creada correctamente' }, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría: ' + error.message },
      { status: 500 }
    );
  }
}

// Eliminar una categoría
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID de la categoría' },
        { status: 400 }
      );
    }
    
    // Verificar si la categoría está siendo utilizada en la tabla de productos
    const checkResult = await executeQuery(
      'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?',
      [id]
    );
    
    // Si la categoría está siendo utilizada, no permitir la eliminación
    if (checkResult.rows[0].count > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta categoría porque tiene productos asociados', 
          inUse: true,
          count: checkResult.rows[0].count 
        },
        { status: 409 } // Conflict status code
      );
    }
    
    // Si no está siendo utilizada, proceder con la eliminación
    const result = await executeQuery(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );
    
    if (result.rows.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Categoría eliminada correctamente' });
    } else {
      return NextResponse.json(
        { error: 'No se encontró la categoría con el ID proporcionado' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json(
      { error: 'Error al eliminar categoría: ' + error.message },
      { status: 500 }
    );
  }
}
