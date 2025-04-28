"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Producto {
  id: number;
  titulo: string;
  categoria_nombre: string;
  precio: number;
  stock: number;
}

export default function Home() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/productos');
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }
      
      const data = await response.json();
      setProductos(data.productos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleCategoriasClick = () => {
    router.push('/categorias');
  };

  const handleAniadirProductosClick = () => {
    router.push('/productos/aniadir');
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        setEliminando(id);
        const response = await fetch(`/api/productos?id=${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al eliminar el producto');
        }
        
        // Actualizar la lista de productos
        setProductos(productos.filter(producto => producto.id !== id));
      } catch (err: any) {
        console.error('Error al eliminar:', err);
        alert(`Error: ${err.message}`);
      } finally {
        setEliminando(null);
      }
    }
  };

  if (isLoading && productos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando catálogo de productos...</p>
      </div>
    );
  }

  if (error && productos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-xl text-red-500">Error: {error}</p>
        <button
          onClick={fetchProductos}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
      </header>
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleCategoriasClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Categorías
        </button>
        <button
          onClick={handleAniadirProductosClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Añadir Producto
        </button>
      </div>
      
      {isLoading && <p className="text-gray-500 mb-4">Actualizando datos...</p>}
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.length > 0 ? (
              productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.categoria_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${producto.precio.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEliminar(producto.id)}
                      disabled={eliminando === producto.id}
                      className={`text-white font-bold py-1 px-3 rounded text-xs ${
                        eliminando === producto.id 
                          ? 'bg-red-300' 
                          : 'bg-red-500 hover:bg-red-700'
                      }`}
                    >
                      {eliminando === producto.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay productos disponibles en el catálogo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
