import json
import os

def filter_poder_ataque():
    """
    Lee poderAtaque.json, lo filtra para mantener solo las entradas con honor: 8,
    y guarda el resultado en poderAtaquemodificado.json.
    """
    input_filename = os.path.join('prisma', 'datosactuales', 'poderAtaque.json')
    output_filename = os.path.join('prisma', 'datosactuales', 'poderAtaquemodificado.json')

    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Filtrar los datos
        filtered_data = [item for item in data if item.get('honor') == 8]

        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(filtered_data, f, indent=2)

        print(f"✅ Proceso completado. Se han guardado {len(filtered_data)} registros en '{output_filename}'.")

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo de entrada '{input_filename}'.")
    except json.JSONDecodeError:
        print(f"❌ Error: El archivo '{input_filename}' no es un JSON válido.")
    except Exception as e:
        print(f"❌ Ocurrió un error inesperado: {e}")

if __name__ == '__main__':
    filter_poder_ataque()
