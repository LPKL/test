# -*- coding: utf-8 -*-
import os, sys, json, time, pyspark, threading
from pyspark.ml.base import Estimator, Model
from pyspark.ml.param import Param, Params
from pyspark.sql.types import *
from pyspark.ml.util import DefaultParamsReadable, DefaultParamsWritable
from pyspark.sql.functions import mean, udf, array, lit
from pyspark.ml.param.shared import HasInputCols, HasOutputCol
from pyspark import keyword_only
from pyspark.ml import Pipeline, PipelineModel


# 自定义参数，基本上，需要为每一个组件自定义参数
# 编写一个参数类，然后 Estimator 和 Model 类继承这些参数类，
# 用于初始化和训练预测。
class HasCustomParam1(Params):
    """
    custom param 1
    """
    custom_1 = Param(Params._dummy(), "custom_1", "custom param 1")

    def __init__(self):
        super(HasCustomParam1, self).__init__()

    def setCustomParam1(self, value):
        return self._set(custom_1=value)

    def getCustomParam1(self):
        return self.getOrDefault(self.custom_1)


class HasCustomParam2(Params):
    """
    custom param 2
    """
    custom_2 = Param(Params._dummy(), "custom_2", "custom param 2")

    def __init__(self):
        super(HasCustomParam2, self).__init__()

    def setCustomParam2(self, value):
        return self._set(custom_2=value)

    def getCustomParam2(self):
        return self.getOrDefault(self.custom_2)


# 自定义Estimator类，要继承所有需要的参数类
class CustomEstimator(Estimator, HasInputCols, HasOutputCol, HasCustomParam1, HasCustomParam2,
                         DefaultParamsReadable, DefaultParamsWritable):
    """
    init Custom Estimator
    """
    @keyword_only
    # 初始化时，传递所有参数
    def __init__(self, inputCols=None, outputCol=None, custom_1=None, custom_2=None):
        super(CustomEstimator, self).__init__()
        kwargs = self._input_kwargs
        self.setParams(**kwargs)

    @keyword_only
    def setParams(self, inputCols=None, outputCol=None, custom_1=None, custom_2=None):
        kwargs = self._input_kwargs
        self._set(**kwargs)

    # 根据参数训练模型，并返回模型
    def _fit(self, df):
        inputCols = self.getInputCols()
        outputCol = self.getOutputCol()
        custom_1 = self.getCustomParam1()
        custom_2 = self.getCustomParam2()
        # 自定义一些操作，如果有计算结果需要传递给Model使用，使用set方法
        return CustomModel() \
                .setInputCols(inputCols) \
                .setOutputCol(outputCol) \
                .setCustomParam1(custom_1) \
                .setCustomParam2(custom_2)

# 用户自定义udf封装函数，不动
def udf_wrapper(return_type):
    """
    udf的返回值类型装饰器
    :param return_type:返回值类型，支持pyspark.sql.types及其组合
    :return:函数
    """

    def udf_func(func):
        return udf(func, returnType=return_type)
    return udf_func


@udf_wrapper(LongType()) # 注意要确定返回值的数据类型
def add_column_custom(custom_1, custom_2, col):
    # 用户自定义函数，实现预期逻辑。
    # 比如，想新增一列y，y = custom_1 * col + custom_2
    return custom_1 * col + custom_2


class CustomModel(Model, HasInputCols, HasOutputCol, HasCustomParam1, HasCustomParam2,
                             DefaultParamsReadable, DefaultParamsWritable):
    """
    Custom Model
    """
    name = "CustomModel"
    def _transform(self, df):
        # 自行编写
        df = df[0]
        inputCols = self.getInputCols()
        outputCol = self.getOutputCol()
        custom_1 = self.getCustomParam1()
        custom_2 = self.getCustomParam2()
        # 生成新列的自定义函数，自行编写
        # 自定义函数中的参数，只能是常值或DataFrame column 类型，常值需要用lit(value)的方式来传递
        df = df.withColumn(outputCol, add_column_custom(lit(custom_1),  lit(custom_2), inputCols[0]))
        # 将输出df封成list形式
        return [df]



class PublicMethods(object):
    """
    提供通用性功能接口,用户可直接调用
    """
    @staticmethod
    def get_data(app=None, data=None, data_path=None, data_key=None, file_format=None):
        """
        通过数据文件路径获取数据, 优先通过data_key读取，若data_key是空值，则通过data_path读取
        :param app:SparkCeleryApp
        :param data_path: 数据文件路径
        :param data_key: 数据文件key
        :return: 返回读取到的数据，数据类型为spark的DataFrame格式
        """
        if isinstance(data, pyspark.sql.dataframe.DataFrame):
            return data
        if data_key is not None:
            if app:
                df = PublicMethods().cache_data(app=app, data_key=data_key, operate='read')
                if df:
                    return df
            else:
                raise Exception("缺少参数app")
        if isinstance(data_path, type(u"abc")):
            if not file_format:
                file_format = os.path.splitext(data_path)[-1].replace(".", "")
            sdf = app.spark.read.format(file_format).options(header='true', inferschema='true').load(data_path).cache()
            return sdf
        elif isinstance(data_path, pyspark.sql.dataframe.DataFrame):
            return data_path
        else:
            raise RuntimeError("data_path format error!")

    @staticmethod
    def cache_data(app=None, data=None, data_key="default", operate=None):
        """
        :param app: SparkCeleryApp
        :param data: 缓存的数据, <object>
        :param data_key:  数据key值，<str>
        :param operate: "read","write"，写入内存或者从内存中读出来
        :return:

        调用例子：
        写入数据到cache中。若key值一样，原数据将被新数据覆盖
        cache_data(data=data, data_key=data_key, operate="write")
        从cache中读数据
        df_spark = cache_data(data=None, data_key=data_key, operate="read")
        """
        res = None
        _data_lock = threading.Lock()
        with _data_lock:
            if operate == "write":
                app._cache[data_key] = data
                res = "ok"
            elif operate == "read":
                if len(data_key)==0:
                    return res
                if data_key in app._cache.keys():
                    res = app._cache[data_key]
                else:
                    print("No such key " + data_key + " in app._cache")
            else:
                raise AttributeError("No such operate" + operate + " in cache_data!")
        return res

    @staticmethod
    def cache_stage(app=None, stage=None, stage_key="default", operate=None):
        """
        :param app: SparkCeleryApp
        :param stage: 缓存的stage, <object>
        :param stage_key:  数据key值，<str>
        :param operate: "read","write"，写入内存或者从内存中读出来
        :return:

        调用例子：
        写入数据到cache中。若key值一样，原数据将被新数据覆盖
        cache_stage(stage=stage, stage_key=stage_key, operate="write")
        从cache中读数据
        df_spark = cache_stage(stage=None, stage_key=stage_key, operate="read")
        """
        res = []
        _data_lock = threading.Lock()
        with _data_lock:
            if operate == "write":
                app._stage[stage_key] = stage
                res = "ok"
            elif operate == "read":
                if not stage_key or len(stage_key) == 0:
                    return res
                if stage_key in app._stage.keys():
                    res = app._stage[stage_key]
                else:
                    print("No such key " + stage_key + " in app._stage")
            else:
                raise AttributeError("No such operate" + operate + " in cache_stage!")
        return res

    @staticmethod
    def pipeline_fit_transform(stage_info, data):
        """
        训练当前组件，并将训练好的模型加入Pipeline Model中
        :param param,<tuple, df, list, str>
        :return:
        """
        stage_list_new = []
        for si in stage_info:
            stage = eval(si[0])(**si[1]) if isinstance(si[0], str) else si[0](**si[1])
            # print(stage.__class__)
            # md_estimator = MDDetection(**config_md)
            # pipline_agg = Pipeline(stages=[stage])
            model = stage.fit(data) if isinstance(stage, Estimator) else stage # 如果是Transformer 则不需要fit
            print(model.__module__)
            if "pyspark.ml" in model.__module__ or si[0] == "IForest": # 原生spark组件 transformer 接收单个 df
                data = model.transform(data)
            else:
                data = data if isinstance(data, list) else [data]  # hwx 2020/4/9
                data = model.transform(data)
            # 将当前model加入Pipeline中，并保存
            stage_list_new.append(model)
        # print(stage_list_new)
        return data, model, stage_list_new

    @staticmethod
    def wrapper_cols_keys_cache_data(app, data, stage_key=None, stage_list=None, label="data", class_name="anonymous", postfixes=None, readHiveDataKey=None):
        """
        缓存数据，封装节点列名及data_key
        :param app: sc & spark
        :param data: spark DataFrame，可传多个
        :param label: 封装标签
        :param class_name: 类名
        :param postfixes: 多个df对象后缀
        :return: ret 包含数据列名及data_key
        """
        data = data if isinstance(data, list) else [data]
        ret = [[label, 0, []], [label, 1, []], [label, 2, {}]]
        if not postfixes:
            postfixes = ["_" + str(i) for i in range(len(data))]

        for df, postfix in zip(data, postfixes):
            data_key = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())) + class_name + postfix if not readHiveDataKey else readHiveDataKey
            PublicMethods().cache_data(app=app, data=df, data_key=data_key, operate="write")
            ret[0][2].append({"data": [df.columns]})
            ret[1][2].append(data_key)
            ret[2][2] = dict(df.dtypes)

        if stage_list:
            PublicMethods().cache_stage(app=app, stage=stage_list, stage_key=stage_key, operate="write")
            ret.append(["stages", 0, stage_key])

        return ret

    @staticmethod
    def load_PipelineModel(model_path):
        # 加载已训练好的模型
        model = PipelineModel.load(model_path)
        return model


class CustomAlgo():
    name = "CustomAlgo"

    def run(self, app=None, data_key=None, data_path=None, config_info=None):
        """
        :param data_key  : If no dataframe, get model from this model_key
        :param data_path: If no dataframe and no data_key, get model from this model_path
        :param config_info: 配置文件路径
        :return: 结果返回到redis
        """
        if isinstance(config_info, bytes):
            config_info = json.loads(config_info.decode("utf-8"))
        # from css.ai.algo.utils.public_methods import PublicMethods
        # 获取上一个组件的输出结果，不动
        data = PublicMethods().get_data(app=app, data_path=data_path, data_key=data_key)
        model_path = config_info.get("model_path") # 用来保存训练好的模型

        # 获取自定义参数，自行编写       
        inputCols = config_info.get("inputCols")
        outputCol = config_info.get("outputCol")
        custom_1 = config_info.get("custom_1")
        custom_2 = config_info.get("custom_2")
         
        # 生成新的参数及初始化自定义Estimator，自行编写
        config_custom = {}
        config_custom["inputCols"] = inputCols
        config_custom["outputCol"] = outputCol
        config_custom["custom_1"] = eval(custom_1) # 传递过来值类型都是str,所以使用eval()方法取值
        config_custom["custom_2"] = eval(custom_2)
        custom_stage = [("CustomEstimator", config_custom)]

        # 不动
        data_new, model, stage_list = PublicMethods().pipeline_fit_transform(custom_stage, data)
        stage_model = PipelineModel(stage_list)
        stage_model.write().overwrite().save(model_path)
        ret = PublicMethods.wrapper_cols_keys_cache_data(app, data_new, stage_key=model.uid, stage_list=stage_list, class_name=self.name, postfixes=None)
        ret.append(["trained_model", 1, model_path])
        return ret


# if __name__ == '__main__':
#     from get_app import SparkConfigBuilder as get_app
#     app = get_app()
#     config_info = {

#         "inputCols": ["flow"],
#         "outputCol": "vv",
#         "custom_1": "2",
#         "custom_2": "3",
#         "model_path": "hhh"
#             }

#     CustomAlgo().run(app, data_path= data_path, data_key=None, config_info=config_info)

