<script>
import Layout from '@layouts/main'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import SessionExpired from '@mixins/session-expired.js'

export default {
  components: { Layout, Loading },
  mixins: [SessionExpired],
  data() {
    return {
      isLoading: false,
      userPlatformCharts: {
        assinaturas: userPlatformChartFactory('', 'Total de Assinaturas'),
        cadastros: userPlatformChartFactory('', 'Total de Cadastros'),
        cancelamentos: userPlatformChartFactory('', 'Assinaturas Canceladas'),
        acessos: userPlatformChartFactory('', 'Total de Acessos')
      },
      usersPlatformSeries: {
        assinaturas: [],
        cadastros: [],
        cancelamentos: [],
        acessos: []
      },
      usersPlatformMonthChart: {
        title: {
          text: 'Dados do Mês'
        },
        chart: {
          height: 500,
          type: 'bar',
          toolbar: {
            show: true,
            export: {
              csv: {
                filename: 'dados-mes',
              },
              svg: {
                filename: 'dados-mes',
              },
              png: {
                filename: 'dados-mes',
              }
            },
          }
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: ['Assinantes', 'Cadastrados', 'Cancelamentos', 'Acessos'],
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        }
      },
      usersPlatformMonthSeries: [{
        data: []
      }],
      usersPlatformPercentageChart: {
        chart: {
          type: 'donut',
          toolbar: {
            show: true,
            export: {
              csv: {
                filename: 'usuarios-cadastrados',
              },
              svg: {
                filename: 'usuarios-cadastrados',
              },
              png: {
                filename: 'usuarios-cadastrados',
              }
            },
          }
        },
        labels: ['Possuem assinatura', 'Não possuem assinatura', 'Cancelaram assinatura'],
        plotOptions: {
          pie: {
            donut: {
              labels: {
                total: {
                  show: true
                }
              } 
            }
          }
        },
        title: {
          text: 'Usuários Cadastrados'
        }
      },
      usersPlatformPercentageSeries: [],
      productsFields: [
        { key: 'pos', label: 'Posição na Tabela' },
        { key: 'nome', label: 'Produto' },
        { key: 'acessos_mes', label: 'Acessos Último Mês' },
        { key: 'total_acessos', label: 'Total de Acessos' },
        { key: 'cidade', label: 'Cidade', sortable: true },
        { key: 'uf', label: 'UF' }
      ],
      productsItems: [],
      supermarketsFields: [
        { key: 'pos', label: 'Posição na Tabela' },
        { key: 'nome', label: 'Mercado' },
        { key: 'acessos_mes', label: 'Acessos Último Mês' },
        { key: 'total_acessos', label: 'Total de Acessos' },
        { key: 'cidade', label: 'Cidade', sortable: true },
        { key: 'uf', label: 'UF' }
      ],
      supermarketsItems: [],
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.isLoading = true
      this.$services.dashboard.getAll()
        .then((response) => {
          this.setUsersPlatformData(response)
          this.setUsersPlatformMonthData(response)
          this.setUsersPlatformPercentageData(response)
          this.setProductsData(response)
          this.setSupermarketsData(response)
        })
        .catch((error) => {
          this.$common.serviceCatch(this, error)
        })
        .finally(() => {
         this.isLoading = false
        })
    },
    setUsersPlatformData(dashboardResponse) {
      const labels = []
      const series = {
        assinaturas: {
          name: 'Assinaturas',
          data: []
        },
        cadastros: {
          name: 'Cadastros',
          data: []
        },
        cancelamentos: {
          name: 'Cancelamentos',
          data: []
        },
        acessos: {
          name: 'Acessos',
          data: []
        }
      }
      const { 
        minMonth, 
        maxMonth, 
        minYear, 
        maxYear 
      } = getMinMax(dashboardResponse)

      for (let year = minYear; year <= maxYear; year++) {
        for (
          let month = year === minYear ? minMonth : 1; 
          year == maxYear ? month <= maxMonth : month <= 12;
          month++
        ) {
          labels.push(`${year}-${month}-01`)
          const platform = {
            ...dashboardResponse.plataforma.usuarios,
            acessos: dashboardResponse.acessos.usuarios,
          }
          for (const key in platform) {
            let found = false
            for (const item of platform[key]) {
              if (item.mes === month && item.ano === year) {
                found = true
                series[key].data.push(item.total || item.acessos)
              }
            }
            if(!found) {
              series[key].data.push(0)
            }
          }
        }
      }


      for (const key in series) {
        this.$set(this.usersPlatformSeries[key], 0, series[key])
        this.$set(this.userPlatformCharts, key, {
            ...this.userPlatformCharts[key],
          xaxis: {
            ...this.userPlatformCharts[key].xaxis,
            categories: labels
          },
          title: {
            ...this.userPlatformCharts[key].title,
            text: series[key].data.reduce((acc, curr) => acc+curr, 0)
          },
        })
      }

      function getMinMax(dashboardResponse) {
        let minMonth  = 12 
        let maxMonth  = 1 
        let minYear   = 2100 
        let maxYear   = 1900
        let lastIndex = 0
        const platform = dashboardResponse.plataforma.usuarios
        for (const key in platform) {
          if(platform[key].length > 0) {
            lastIndex = platform[key].length - 1
            minMonth  = platform[key][0].mes < minMonth ? platform[key][0].mes : minMonth
            minYear   = platform[key][0].ano < minYear ?  platform[key][0].ano : minYear
            maxMonth  = platform[key][lastIndex].mes > maxMonth ?  platform[key][lastIndex].mes : maxMonth
            maxYear   = platform[key][lastIndex].ano > maxYear ?  platform[key][lastIndex].ano : maxYear
          }
        }
        return { minMonth, minYear, maxMonth, maxYear }
      }
    },
    setUsersPlatformMonthData(dashboardResponse) {
      const platform = {
        ...dashboardResponse.plataforma.usuarios,
        acessos: dashboardResponse.acessos.usuarios,
      }
      const currDate = new Date()
      const [month, year] = [currDate.getMonth() + 1, currDate.getFullYear()]

      for (const key in platform) {
        let found = false
        for (const item of platform[key]) {
          if (item.mes === month && item.ano === year) {
            found = true
            this.usersPlatformMonthSeries[0].data.push(item.total || item.acessos)
          }
        }
        if(!found) {
          this.usersPlatformMonthSeries[0].data.push(0)
        }
      }
    },
    setUsersPlatformPercentageData(dashboardResponse) {
      const platform = dashboardResponse.plataforma.usuarios
      const percentageData = {
        assinaturas: 0,
        cadastros: 0,
        cancelamentos: 0,
      }
      for (const key in platform) {
        percentageData[key] = platform[key].reduce((acc, curr) => acc + curr.total, 0)
      }
      percentageData.cadastros = percentageData.cadastros - (percentageData.assinaturas + percentageData.cancelamentos)
      for(const key in percentageData) {
        this.usersPlatformPercentageSeries.push(percentageData[key])
      }
    },
    setProductsData(dashboardResponse) {
      const products = dashboardResponse.acessos.produtos
      for (const product of products) {
        this.productsItems.push({
          nome: product.preco.produto.descricao,
          acessos_mes: getCurrMonthAccess(product.acessos),
          total_acessos: product.acessos.reduce((acc, curr) => acc + curr.total, 0),
          cidade: product.preco.produto.cidade || '',
          uf: product.preco.produto.uf || '',
        })
      }
    },
    setSupermarketsData(dashboardResponse) {
      const supermarkets =  dashboardResponse.acessos.mercados
      for (const supermarket of supermarkets) {
        this.supermarketsItems.push({
          nome: supermarket.mercado.nome,
          acessos_mes: getCurrMonthAccess(supermarket.acessos),
          total_acessos: supermarket.acessos.reduce((acc, curr) => acc + curr.total, 0),
          cidade: supermarket.mercado.endereco.cidade || '',
          uf: supermarket.mercado.endereco.uf || ''
        })
      }
    }
  }
}

function getCurrMonthAccess(access) {
  const currDate = new Date()
  const [month, year] = [currDate.getMonth() + 1, currDate.getFullYear()]

  for (const acc of access) {
    if (acc.mes === month && acc.ano === year) {
      return acc.total
    }
  }
  return 0
}

function userPlatformChartFactory(title, subtitle) {
  return {
    chart: {
      group: 'plataforma-usuarios',
      type: 'area',
      height: 160,
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: true,
        export: {
          csv: {
            filename: subtitle.toLowerCase(),
          },
          svg: {
            filename: subtitle.toLowerCase(),
          },
          png: {
            filename: subtitle.toLowerCase(),
          }
        },
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    fill: {
      opacity: 0.3,
    },
    colors: ['#DCE6EC'],
    yaxis: {
      show: false,
      min: 0
    },
    xaxis: {
      type: 'datetime',
    },
    title: {
      text: title,
      offsetX: 30,
      style: {
        fontSize: '24px',
        cssClass: 'apexcharts-yaxis-title'
      }
    },
    subtitle: {
      text: subtitle,
      offsetX: 30,
      style: {
        fontSize: '14px',
        cssClass: 'apexcharts-yaxis-title'
      }
    },
    tooltip: {
      x: {
        format: 'MM/yyyy'
      },
    },
  }
}
</script>
<template>
  <Layout>
    <div class="bloco">
      <div class="cabecalho">
        <div class="row">
          <div class="col-xl-12">
            <div class="titulo">Dashboard</div>
            <div class="subTitulo"></div>
            <div class="borda"></div>
            <div class="row">
              <div class="col-12 d-flex justify-content-between mb-4">
                <apexchart 
                  type="area" 
                  width="80%"
                  :options="userPlatformCharts.assinaturas" 
                  :series="usersPlatformSeries.assinaturas"
                ></apexchart>
                <apexchart 
                  type="area" 
                  width="80%"
                  :options="userPlatformCharts.cadastros" 
                  :series="usersPlatformSeries.cadastros"
                ></apexchart>
                <apexchart 
                  type="area" 
                  width="80%"
                  :options="userPlatformCharts.cancelamentos" 
                  :series="usersPlatformSeries.cancelamentos"
                ></apexchart>
                <apexchart 
                  type="area" 
                  width="80%"
                  :options="userPlatformCharts.acessos" 
                  :series="usersPlatformSeries.acessos"
                ></apexchart>
              </div>
            </div>
            <div class="row my-4">
              <div class="col-6">
                <apexchart 
                  type="bar" 
                  width="90%"
                  :options="usersPlatformMonthChart" 
                  :series="usersPlatformMonthSeries"
                ></apexchart>
              </div>
              <div class="col-6">
                <apexchart 
                  type="donut" 
                  width="90%"
                  :options="usersPlatformPercentageChart" 
                  :series="usersPlatformPercentageSeries"
                ></apexchart>
              </div>
            </div>
            <div class="row my-4">
              <div class="col-6">
                <b-table
                  class="" 
                  caption-top
                  hover
                  responsive
                  small
                  sort-by="acessos_mes"
                  :sort-desc="true"
                  :fields="productsFields"
                  :items="productsItems"
                >
                  <template #table-caption><h2 class="text-center">Produtos</h2></template>
                  <template #cell(pos)="data">{{ data.index + 1 }}</template>
                </b-table>
              </div>
              <div class="col-6">
                <b-table
                  class="" 
                  caption-top
                  hover
                  responsive
                  small
                  sort-by="acessos_mes"
                  :sort-desc="true"
                  :fields="supermarketsFields"
                  :items="supermarketsItems"
                >
                  <template #table-caption><h2 class="text-center">Mercados</h2></template>
                  <template #cell(pos)="data">{{ data.index + 1 }}</template>
                </b-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
    <Loading :active.sync="isLoading" color="#111d5e" :can-cancel="false"></Loading>
  </Layout>
</template>
<style lang="scss">
.bloco {
  margin-top: 30px;
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  .titulo {
    font-size: 25px;
    color: #111d5e;
    margin-bottom: 10px;
    font-weight: bold;
  }
  .subtitulo {
    margin-bottom: 10px;
  }
  .borda {
    margin-top: 15px;
    margin-bottom: 15px;
    border-bottom: solid 1px #edeff4;
    width: 150%;
    margin-left: -50%;
    margin-right: -50%;
  }
  .formulario {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .btn-merfish {
    margin-top: 30px;
    margin-bottom: 10px;
    background-color: #111d5e;
    padding: 5px 30px;
    &.botaoTopo {
      float: right;
    }
  }
}
</style>
