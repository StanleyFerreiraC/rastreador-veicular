# Rastreador Veicular

Painel web de um protótipo acadêmico de rastreamento veicular com hibernação em local seguro para poupar a bateria. O front-end usa Vite, React e TypeScript.

O painel exibe os dados do veículo e do rastreador, a última posição do GPS, a ancoragem e a janela de hibernação. A consulta roda ao abrir a página e se repete a cada 30 segundos por padrão. Use **Atualizar agora** para consultar na hora. Se uma consulta falhar, o painel mantém a última resposta bem-sucedida e tenta novamente.

## Rodar localmente

Requisitos: Node.js 20.19+ ou 22.12+ em uma versão suportada pelo Vite, e npm.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. O painel usa os dados da API por padrão. Acrescente `?modo=demo` à URL para abrir a demonstração com três veículos simulados e sem chamadas ao backend.

## Configuração local

O painel funciona com os valores padrão. Para alterá-los, copie `.env.example` para `.env.local` e reinicie o Vite após editar o arquivo.

| Variável | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | URL base do backend. Por padrão, aponta para a API do projeto. |
| `VITE_TRACKER_POLL_SECONDS` | Intervalo entre o término de uma consulta e o início da próxima. Aceita inteiros de 5 a 3600. O padrão é 30. |
| `VITE_GOOGLE_MAPS_EMBED_KEY` | Chave da Maps Embed API para incorporar as coordenadas reais no painel. É opcional para rodar o projeto. |

### Google Maps

O link **Abrir no Google Maps** acompanha a última posição ou o local seguro selecionado. O modo demo já tem um mapa incorporado para os pontos simulados.

Para incorporar o mapa com dados reais, habilite a **Maps Embed API** no projeto Google Cloud e adicione a chave em `.env.local`. Restrinja a chave a essa API e aos endereços do front-end, por exemplo `http://localhost:5173/*` e `http://127.0.0.1:5173/*`, conforme o endereço que você usa. As variáveis `VITE_*` ficam disponíveis no navegador. Use uma chave de navegador com essas restrições e mantenha o arquivo local fora do Git. [Configuração da Maps Embed API](https://developers.google.com/maps/documentation/embed/get-api-key)

## API

O painel lê `GET /api/Rastreador` sem autenticação. A listagem inclui os dados de identificação, `veiculo`, `modoEconomia`, `posicaoAtual` e `modoSono`. A posição e a configuração do modo sono podem vir nulas. A data da última posição registrada pelo GPS é exibida separadamente do horário da última consulta bem-sucedida. Os horários com fuso são apresentados no horário de Brasília. [Swagger da API](https://rastreador-api-103305944170.us-central1.run.app/swagger/index.html)

## Verificar e gerar o build

```sh
npm run lint
npm run build
npm run preview
```

O build é gerado em `dist/`. O comando `npm run preview` serve esse build localmente.